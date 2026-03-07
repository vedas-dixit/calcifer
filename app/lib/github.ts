import type { AnalysisMode, RepoMetadata } from "./types";

const GITHUB_API = "https://api.github.com";
const RAW_BASE = "https://raw.githubusercontent.com";

// ---------------------------------------------------------------------------
// File classification
// ---------------------------------------------------------------------------

const CODE_EXTS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "go", "rs", "rb", "java", "cpp", "c", "h", "cs",
  "php", "swift", "kt", "scala", "clj", "elm", "ex", "exs",
  "vue", "svelte", "astro", "zig", "nim",
]);

const CONFIG_EXTS = new Set(["json", "yaml", "yml", "toml", "ini"]);
const DOC_EXTS = new Set(["md", "mdx", "txt", "rst"]);

const SKIP_PREFIXES = [
  "node_modules/", "dist/", "build/", ".next/", ".nuxt/",
  "vendor/", "__pycache__/", ".venv/", "venv/", "env/",
  "target/", "out/", "coverage/", ".nyc_output/",
  ".git/", ".cache/", ".turbo/", ".parcel-cache/",
  "public/", "static/", "assets/",
];

const SKIP_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "cargo.lock", "poetry.lock", "go.sum", "gemfile.lock",
  "composer.lock", "bun.lockb",
]);

// Named files that are always high priority
const FILE_PRIORITY: Record<string, number> = {
  "readme.md": 100, "readme.mdx": 100, "readme.rst": 95, "readme.txt": 90,
  "contributing.md": 95, "contributing.rst": 90,
  "package.json": 88, "pyproject.toml": 88, "cargo.toml": 88,
  "go.mod": 88, "gemfile": 85, "composer.json": 85, "build.gradle": 82,
  "makefile": 75, "dockerfile": 72,
  "docker-compose.yml": 70, "docker-compose.yaml": 70,
  ".env.example": 65, ".env.sample": 65,
  "tsconfig.json": 62, "jsconfig.json": 60,
  "next.config.ts": 60, "next.config.js": 60,
  "vite.config.ts": 60, "vite.config.js": 60,
  "webpack.config.js": 58,
};

const IMPORTANT_SEGMENTS = [
  "src/index", "app/index", "src/main", "app/main",
  "index", "main", "server", "app",
  "src/app", "src/core", "src/lib",
  "routes", "router", "middleware",
  "core", "lib", "utils", "helpers", "services",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoFile {
  path: string;
  content: string;
}

export interface GoodFirstIssue {
  title: string;
  number: number;
  url: string;
}

export interface RepoContext {
  metadata: RepoMetadata;
  treeStr: string;
  files: RepoFile[];
  goodFirstIssues: GoodFirstIssue[];
}

// ---------------------------------------------------------------------------
// URL parsing
// ---------------------------------------------------------------------------

export function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const m = url.trim().match(/github\.com[/:]([^/\s]+)\/([^/\s?#]+)/);
  if (!m) {
    throw new Error(
      "Not a valid GitHub URL. Expected format: https://github.com/owner/repo"
    );
  }
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function makeHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function ghFetch(path: string, token?: string): Promise<Response> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: makeHeaders(token),
  });

  if (res.status === 404) {
    throw new Error("Repository not found. Make sure it exists and is public.");
  }
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("X-RateLimit-Reset");
    const when = reset
      ? ` Resets at ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`
      : "";
    throw new Error(
      `GitHub API rate limited.${when} Add a GitHub token in Settings (⚙) to get 5,000 req/hr.`
    );
  }
  if (res.status === 401) {
    throw new Error("Invalid GitHub token. Update it in Settings (⚙).");
  }
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res;
}

async function ghJson<T>(path: string, token?: string): Promise<T> {
  const res = await ghFetch(path, token);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// File tree
// ---------------------------------------------------------------------------

interface RawRepo {
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  html_url: string;
  default_branch: string;
}

export interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

function shouldSkip(path: string): boolean {
  const lower = path.toLowerCase();
  const filename = lower.split("/").pop()!;
  if (SKIP_FILES.has(filename)) return true;
  if (filename.endsWith(".min.js") || filename.endsWith(".min.css")) return true;
  for (const p of SKIP_PREFIXES) {
    if (lower.startsWith(p)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// File scoring — determines which files are most valuable to read
// ---------------------------------------------------------------------------

export function scoreFile(path: string, mode: AnalysisMode, focus: string): number {
  if (shouldSkip(path)) return -1;

  const lower = path.toLowerCase();
  const parts = lower.split("/");
  const filename = parts[parts.length - 1];
  const extParts = filename.split(".");
  const ext = extParts.length > 1 ? extParts[extParts.length - 1] : "";

  let score = 0;

  // Named priority override
  if (FILE_PRIORITY[filename] !== undefined) {
    score += FILE_PRIORITY[filename];
  }

  // Extension scoring — skip anything that looks binary
  if (CODE_EXTS.has(ext)) score += 30;
  else if (CONFIG_EXTS.has(ext)) score += 12;
  else if (DOC_EXTS.has(ext)) score += 18;
  else return -1;

  // Shallower paths are more architecturally important
  score += Math.max(0, 14 - parts.length * 2);

  // Important path segments
  for (const seg of IMPORTANT_SEGMENTS) {
    if (lower.includes(seg)) {
      score += 20;
      break;
    }
  }

  // Test files — lower priority in general, slight boost for bug hunt
  if (lower.includes("test") || lower.includes("spec") || lower.includes("__tests__")) {
    score += mode === "bugs" ? 5 : -20;
  }

  // Mode-specific boosts
  if (mode === "contribution") {
    if (lower.includes("contributing") || lower.includes("code_of_conduct")) score += 60;
    if (lower.includes(".github")) score += 15;
    if (lower.includes("example") || lower.includes("demo") || lower.includes("tutorial")) score += 20;
    if (lower.includes("issue_template") || lower.includes("pull_request_template")) score += 25;
    if (lower.includes("setup") || lower.includes("getting-started") || lower.includes("quickstart")) score += 20;
  }

  if (mode === "bugs") {
    if (lower.includes("auth") || lower.includes("security") || lower.includes("session") || lower.includes("token")) score += 25;
    if (lower.includes("api") || lower.includes("route") || lower.includes("handler") || lower.includes("controller")) score += 20;
    if (lower.includes("middleware")) score += 18;
    if (lower.includes("error") || lower.includes("exception")) score += 15;
    if (lower.includes("util") || lower.includes("helper") || lower.includes("sanitiz") || lower.includes("valid")) score += 12;
    if (lower.includes("db") || lower.includes("database") || lower.includes("query") || lower.includes("sql")) score += 20;
  }

  if (mode === "documentation") {
    if (lower.includes("types") || lower.includes("interface") || lower.includes("model") || lower.includes("schema")) score += 22;
    if (lower.includes("config")) score += 18;
    if (lower.includes("constant") || lower.includes("enum")) score += 15;
    if (lower.includes("architecture") || lower.includes("design")) score += 20;
  }

  // Focus area keyword boost (big boost — user specifically asked for this)
  if (focus) {
    const words = focus.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
    if (words.some((w) => lower.includes(w))) score += 50;
  }

  return score;
}

// ---------------------------------------------------------------------------
// File content via raw CDN — no GitHub API rate limits, no auth needed
// ---------------------------------------------------------------------------

export async function fetchRawContent(
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string | null> {
  try {
    // encodeURI preserves slashes; encode each segment for special chars
    const encoded = path.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(`${RAW_BASE}/${owner}/${repo}/${branch}/${encoded}`);
    if (!res.ok) return null;

    const text = await res.text();

    // Heuristic binary check
    if (text.includes("\x00")) return null;

    // Truncate very large files
    if (text.length > 14000) {
      return text.slice(0, 14000) + "\n\n... [file truncated at 14k chars]";
    }
    return text;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Good first issues
// ---------------------------------------------------------------------------

export async function fetchGoodFirstIssues(
  owner: string,
  repo: string,
  token?: string
): Promise<GoodFirstIssue[]> {
  try {
    const issues = await ghJson<Array<{ title: string; number: number; html_url: string }>>(
      `/repos/${owner}/${repo}/issues?labels=good+first+issue&state=open&per_page=8`,
      token
    );
    return Array.isArray(issues)
      ? issues.map((i) => ({ title: i.title, number: i.number, url: i.html_url }))
      : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Lightweight bootstrap — metadata + tree only, no file reads
// Used by the agentic runner so the agent controls what files to fetch
// ---------------------------------------------------------------------------

export interface RepoAndTree {
  metadata: RepoMetadata;
  branch: string;
  blobs: TreeItem[];
  treeStr: string;
}

export async function fetchRepoAndTree(
  owner: string,
  repo: string,
  token: string | undefined,
  onProgress: (step: string, sub?: string) => void
): Promise<RepoAndTree> {
  onProgress("> Fetching repository metadata...", `→ Checking ${owner}/${repo}`);
  const raw = await ghJson<RawRepo>(`/repos/${owner}/${repo}`, token);

  const metadata: RepoMetadata = {
    owner,
    repo,
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
    openIssues: raw.open_issues_count,
    url: raw.html_url,
  };

  const branch = raw.default_branch;

  onProgress("> Scanning codebase...", "→ Mapping the file system...");
  const treeData = await ghJson<{ tree: TreeItem[]; truncated: boolean }>(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );

  const blobs = treeData.tree.filter((e) => e.type === "blob");

  const visiblePaths = blobs
    .filter((e) => !shouldSkip(e.path))
    .map((e) => e.path)
    .slice(0, 500);
  const treeStr =
    visiblePaths.join("\n") +
    (treeData.truncated || blobs.length > 500 ? "\n... [and more files]" : "");

  return { metadata, branch, blobs, treeStr };
}

// ---------------------------------------------------------------------------
// Main context builder (kept for reference / fallback)
// ---------------------------------------------------------------------------

export async function buildRepoContext(
  owner: string,
  repo: string,
  mode: AnalysisMode,
  focus: string,
  token: string | undefined,
  onProgress: (step: string, sub?: string) => void
): Promise<RepoContext> {
  // 1. Metadata + default branch (single API call)
  onProgress("> Fetching repository metadata...", `→ Checking ${owner}/${repo}`);
  const raw = await ghJson<RawRepo>(`/repos/${owner}/${repo}`, token);

  const metadata: RepoMetadata = {
    owner,
    repo,
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
    openIssues: raw.open_issues_count,
    url: raw.html_url,
  };

  const branch = raw.default_branch;

  // 2. File tree (single API call)
  onProgress("> Scanning codebase...", "→ Mapping the file system...");
  const treeData = await ghJson<{ tree: TreeItem[]; truncated: boolean }>(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );

  const blobs = treeData.tree.filter((e) => e.type === "blob");

  // Build a readable tree string for the prompt (up to 400 visible entries)
  const visiblePaths = blobs
    .filter((e) => !shouldSkip(e.path))
    .map((e) => e.path)
    .slice(0, 400);
  const treeStr =
    visiblePaths.join("\n") +
    (treeData.truncated || blobs.length > 400 ? "\n... [and more files]" : "");

  // 3. Score and select the most relevant files
  const totalVisible = blobs.filter((e) => !shouldSkip(e.path)).length;
  const selected = blobs
    .map((e) => ({ path: e.path, score: scoreFile(e.path, mode, focus) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((e) => e.path);

  onProgress(
    "> Reading key files...",
    `→ Scavenging ${selected.length} critical files from ${totalVisible} total`
  );

  // 4. Fetch file contents via raw CDN (no rate limits)
  const files: RepoFile[] = [];
  for (const path of selected) {
    const content = await fetchRawContent(owner, repo, branch, path);
    if (content !== null) {
      files.push({ path, content });
    }
  }

  // 5. Good first issues (only for contribution mode)
  let goodFirstIssues: GoodFirstIssue[] = [];
  if (mode === "contribution") {
    onProgress("> Checking open issues...", "→ Looking for beginner-friendly tasks...");
    goodFirstIssues = await fetchGoodFirstIssues(owner, repo, token);
  }

  return { metadata, treeStr, files, goodFirstIssues };
}
