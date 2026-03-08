import {
  parseGitHubUrl,
  fetchRepoAndTree,
  fetchRawContent,
  fetchGoodFirstIssues,
  scoreFile,
} from "./github";
import { extractSymbols, formatSymbolSummary } from "./symbols";
import { buildSystemPrompt, buildInitialMessage } from "./prompts";
import { runAgentLoop } from "./gemini";
import { storage } from "./storage";
import type { AnalysisMode, AgentResult, AgentProgress, StepLog } from "./types";

// ---------------------------------------------------------------------------
// Agent options
// ---------------------------------------------------------------------------

export interface AgentOptions {
  url: string;
  mode: AnalysisMode;
  focus: string;
  onProgress: (progress: AgentProgress) => void;
}

// ---------------------------------------------------------------------------
// Progress tracker
// ---------------------------------------------------------------------------

class ProgressTracker {
  private steps: StepLog[] = [];
  private percent = 0;
  private readonly cb: (p: AgentProgress) => void;

  constructor(cb: (p: AgentProgress) => void) {
    this.cb = cb;
  }

  push(id: string, message: string, sub: string | undefined, pct: number) {
    if (this.steps.length > 0) {
      const last = this.steps[this.steps.length - 1];
      this.steps[this.steps.length - 1] = { ...last, status: "complete" };
    }
    this.percent = pct;
    const step: StepLog = { id, message, sub, status: "active" };
    this.steps.push(step);
    this.emit();
  }

  error() {
    if (this.steps.length > 0) {
      const last = this.steps[this.steps.length - 1];
      this.steps[this.steps.length - 1] = { ...last, status: "error" };
    }
    this.emit();
  }

  complete() {
    if (this.steps.length > 0) {
      const last = this.steps[this.steps.length - 1];
      this.steps[this.steps.length - 1] = { ...last, status: "complete" };
    }
    this.percent = 100;
    this.emit();
  }

  private emit() {
    this.cb({
      steps: [...this.steps],
      currentStep: this.steps.length - 1,
      totalSteps: this.steps.length,
      percent: this.percent,
    });
  }
}

// ---------------------------------------------------------------------------
// Main agent runner
// ---------------------------------------------------------------------------

export async function runAgent(opts: AgentOptions): Promise<AgentResult> {
  const { url, mode, focus, onProgress } = opts;

  const geminiKey = storage.getApiKey();
  if (!geminiKey) {
    throw new Error("No Gemini API key found. Add one in Settings (⚙).");
  }
  const githubKey = storage.getGithubKey() ?? undefined;

  const tracker = new ProgressTracker(onProgress);

  try {
    // ── Boot ──
    tracker.push("boot", "> CALCIFER.EXE — warming up", "→ Locking onto target...", 5);

    // ── Parse URL ──
    tracker.push("parse", "> Parsing repository coordinates...", `→ Target: ${url}`, 10);
    const { owner, repo } = parseGitHubUrl(url);

    // ── Fetch tree + metadata (2 GitHub API calls, no LLM) ──
    const { metadata, branch, blobs, treeStr } = await fetchRepoAndTree(
      owner,
      repo,
      githubKey,
      (message, sub) => {
        const pctMap: Record<string, number> = {
          "> Fetching repository metadata...": 18,
          "> Scanning codebase...": 28,
        };
        const id = message.replace(/[^a-z]/gi, "").slice(0, 12).toLowerCase();
        tracker.push(id, message, sub, pctMap[message] ?? 22);
      }
    );

    // ── Symbol extraction — free, no LLM ──
    // Score all blobs, take top 15, fetch content, extract symbols
    tracker.push(
      "symbols",
      "> Extracting code structure...",
      `→ Building repo map from ${blobs.filter((b) => !b.path.includes("node_modules")).length} files...`,
      38
    );

    const scored = blobs
      .map((e) => ({ path: e.path, score: scoreFile(e.path, mode, focus) }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    const symbolLines: string[] = [];
    for (const { path } of scored) {
      const content = await fetchRawContent(owner, repo, branch, path);
      if (content) {
        const symbols = extractSymbols(path, content);
        const summary = formatSymbolSummary(path, symbols);
        symbolLines.push(summary ? `${path}\n${summary}` : path);
      }
    }

    // ── Fetch good first issues for contribution mode ──
    let goodFirstIssues: Awaited<ReturnType<typeof fetchGoodFirstIssues>> = [];
    if (mode === "contribution") {
      tracker.push(
        "issues",
        "> Checking open issues...",
        "→ Looking for beginner-friendly tasks...",
        45
      );
      goodFirstIssues = await fetchGoodFirstIssues(owner, repo, githubKey);
    }

    // ── Agent loop — Gemini with function calling ──
    tracker.push(
      "agent",
      "> CALCIFER is on the move...",
      "→ Studying the codebase map...",
      50
    );

    // Each round of file fetching becomes a new visible step
    // Percent: 50 → 85 spread across up to 7 rounds (~5% per round)
    // Build a fast lookup set of all known blob paths
    const knownPaths = new Set(blobs.map((b) => b.path));

    const output = await runAgentLoop({
      systemPrompt: buildSystemPrompt(mode, focus),
      model: storage.getModel(),
      initialMessage: buildInitialMessage(
        mode,
        metadata,
        treeStr,
        symbolLines.join("\n\n"),
        focus,
        goodFirstIssues
      ),
      apiKey: geminiKey,

      fetchFiles: async (paths) => {
        const results: Array<{ path: string; content: string }> = [];
        const notInTree: string[] = [];
        const fetchFailed: string[] = [];

        for (const path of paths) {
          if (!knownPaths.has(path)) {
            notInTree.push(path);
            continue;
          }
          const content = await fetchRawContent(owner, repo, branch, path);
          if (content !== null) {
            results.push({ path, content });
          } else {
            fetchFailed.push(path);
          }
        }

        return { files: results, notInTree, fetchFailed };
      },

      onToolCall: (reason, paths, round) => {
        const pct = Math.min(50 + round * 6, 85);
        const fileList =
          paths.slice(0, 3).join(", ") + (paths.length > 3 ? ` +${paths.length - 3} more` : "");
        tracker.push(`round-${round}`, `> ${reason}`, `→ Reading: ${fileList}`, pct);
      },
    });

    // ── Done ──
    tracker.push("done", "> Mission complete.", `→ Report ready for ${owner}/${repo}`, 100);
    tracker.complete();

    return { metadata, output, mode };
  } catch (err) {
    tracker.error();
    throw err;
  }
}
