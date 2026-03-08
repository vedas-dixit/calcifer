import { GoogleGenerativeAI, SchemaType, type Part } from "@google/generative-ai";
import { DEFAULT_MODEL } from "./storage";

const MAX_ROUNDS = 7;
const MAX_FILES_TOTAL = 60;
const MAX_FILE_CHARS = 10_000;

// ---------------------------------------------------------------------------
// Agent loop config
// ---------------------------------------------------------------------------

export interface AgentLoopConfig {
  systemPrompt: string;
  initialMessage: string;
  apiKey: string;
  model?: string;
  fetchFiles: (paths: string[]) => Promise<{
    files: Array<{ path: string; content: string }>;
    notInTree: string[];
    fetchFailed: string[];
  }>;
  // Called each time the agent uses read_files — use this to update UI progress
  onToolCall: (reason: string, paths: string[], round: number) => void;
}

// ---------------------------------------------------------------------------
// Gemini function declarations
// ---------------------------------------------------------------------------

// Only one tool: read_files. When done, the agent writes the report as plain text.
// produce_report was removed — Gemini can't serialize multi-thousand-char strings
// as function call arguments without MALFORMED_FUNCTION_CALL errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOL_DECLARATIONS: any[] = [
  {
    name: "read_files",
    description:
      "Fetch the full content of specific files from the repository. " +
      "Use this to read files you want to examine after seeing the repo map. " +
      "Call with up to 15 paths per round. The reason you provide is shown in the UI.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        paths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "File paths relative to repo root.",
        },
        reason: {
          type: SchemaType.STRING,
          description:
            "One short sentence explaining what you're looking for — shown to the user as a progress update.",
        },
      },
      required: ["paths", "reason"],
    },
  },
];

// ---------------------------------------------------------------------------
// Main agent loop
// ---------------------------------------------------------------------------

export async function runAgentLoop(config: AgentLoopConfig): Promise<string> {
  const { systemPrompt, initialMessage, apiKey, fetchFiles, onToolCall } = config;
  const modelId = config.model ?? DEFAULT_MODEL;

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
    systemInstruction: systemPrompt,
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
  });

  const chat = model.startChat();
  let response = await chat.sendMessage(initialMessage);
  let totalFilesRead = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const calls = response.response.functionCalls();

    // Model returned plain text (no tool call) — treat as final report
    if (!calls || calls.length === 0) {
      const text = response.response.text();
      if (text.trim()) return text;
      throw new Error("CALCIFER went silent — no report produced. Please try again.");
    }

    // Process read_files calls (model may batch multiple in one turn)
    const responseParts: Part[] = [];

    for (const call of calls) {
      if (call.name !== "read_files") continue;

      const { paths, reason } = call.args as { paths: string[]; reason: string };

      // Cap per-round and total reads
      const remaining = MAX_FILES_TOTAL - totalFilesRead;
      if (remaining <= 0) {
        responseParts.push({
          functionResponse: {
            name: "read_files",
            response: {
              result:
                "[SYSTEM: File limit reached. Stop calling read_files and write your report now as plain text.]",
            },
          },
        });
        continue;
      }

      const limited = paths.slice(0, Math.min(15, remaining));
      onToolCall(reason, limited, round + 1);

      const { files, notInTree, fetchFailed } = await fetchFiles(limited);
      totalFilesRead += files.length;

      const fileBlocks = files
        .map((f) => {
          const ext = f.path.split(".").pop() ?? "";
          const content =
            f.content.length > MAX_FILE_CHARS
              ? f.content.slice(0, MAX_FILE_CHARS) + "\n\n... [truncated]"
              : f.content;
          return `### ${f.path}\n\`\`\`${ext}\n${content}\n\`\`\``;
        })
        .join("\n\n");

      const warnings: string[] = [];
      if (notInTree.length > 0) {
        warnings.push(
          `[SYSTEM: These paths do NOT exist in the repository tree — do not request them again: ${notInTree.join(", ")}]`
        );
      }
      if (fetchFailed.length > 0) {
        warnings.push(
          `[SYSTEM: These paths exist in the tree but could not be fetched (binary or empty): ${fetchFailed.join(", ")}]`
        );
      }

      let result =
        files.length > 0
          ? `Read ${files.length} file(s):\n\n${fileBlocks}`
          : "No files could be read.";

      if (warnings.length > 0) result += "\n\n" + warnings.join("\n");

      // Nudge the agent to wrap up when approaching limits
      if (totalFilesRead >= MAX_FILES_TOTAL * 0.8) {
        result += `\n\n[SYSTEM: ${totalFilesRead}/${MAX_FILES_TOTAL} files read. Wrap up soon — write your report as plain text when ready.]`;
      }

      responseParts.push({
        functionResponse: { name: "read_files", response: { result } },
      });
    }

    if (responseParts.length === 0) break;

    // Force report on the final allowed round
    if (round === MAX_ROUNDS - 2) {
      responseParts.push({
        functionResponse: {
          name: "read_files",
          response: {
            result:
              "[SYSTEM: This is your last round. Do NOT call read_files again. Write your complete report now as plain text markdown.]",
          },
        },
      });
    }

    response = await chat.sendMessage(responseParts);
  }

  throw new Error("CALCIFER exhausted all rounds without a report. Try a more focused analysis.");
}
