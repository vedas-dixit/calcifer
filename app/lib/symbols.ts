// ---------------------------------------------------------------------------
// Symbol extractor — regex-based, no AST, works for common languages
// Gives the agent structural awareness of files without reading full content
// ---------------------------------------------------------------------------

export interface FileSymbols {
  functions: string[];
  classes: string[];
  exports: string[];
  routes: string[];
}

export function extractSymbols(path: string, content: string): FileSymbols {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const s: FileSymbols = { functions: [], classes: [], exports: [], routes: [] };

  if (["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(ext)) {
    for (const m of content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g))
      s.functions.push(m[1]);
    for (const m of content.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g))
      s.functions.push(m[1]);
    for (const m of content.matchAll(/(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g))
      s.classes.push(m[1]);
    for (const m of content.matchAll(
      /export\s+(?:default\s+)?(?:const|let|function|class|type|interface|enum)\s+(\w+)/g
    ))
      s.exports.push(m[1]);
    // Express routes
    for (const m of content.matchAll(
      /(?:router|app)\.(get|post|put|patch|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]/g
    ))
      s.routes.push(`${m[1].toUpperCase()} ${m[2]}`);
    // Next.js route handlers
    for (const m of content.matchAll(
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD)\b/g
    ))
      s.routes.push(m[1]);
  } else if (ext === "py") {
    for (const m of content.matchAll(/^def\s+(\w+)\s*\(/gm)) s.functions.push(m[1]);
    for (const m of content.matchAll(/^class\s+(\w+)/gm)) s.classes.push(m[1]);
    for (const m of content.matchAll(
      /@(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
    ))
      s.routes.push(`${m[1].toUpperCase()} ${m[2]}`);
  } else if (ext === "go") {
    for (const m of content.matchAll(/^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\(/gm))
      s.functions.push(m[1]);
    for (const m of content.matchAll(/type\s+(\w+)\s+struct/g)) s.classes.push(m[1]);
  } else if (ext === "php") {
    for (const m of content.matchAll(
      /(?:public|private|protected|static)?\s*function\s+(\w+)\s*\(/g
    ))
      s.functions.push(m[1]);
    for (const m of content.matchAll(/class\s+(\w+)/g)) s.classes.push(m[1]);
    for (const m of content.matchAll(
      /Route::(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
    ))
      s.routes.push(`${m[1].toUpperCase()} ${m[2]}`);
  } else if (ext === "rb") {
    for (const m of content.matchAll(/def\s+(\w+)/g)) s.functions.push(m[1]);
    for (const m of content.matchAll(/class\s+(\w+)/g)) s.classes.push(m[1]);
    // Rails routes
    for (const m of content.matchAll(
      /(?:get|post|put|patch|delete)\s+['"`]([^'"`]+)['"`]/g
    ))
      s.routes.push(m[1]);
  } else if (ext === "rs") {
    for (const m of content.matchAll(/(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/g))
      s.functions.push(m[1]);
    for (const m of content.matchAll(/(?:pub\s+)?struct\s+(\w+)/g)) s.classes.push(m[1]);
    for (const m of content.matchAll(/(?:pub\s+)?enum\s+(\w+)/g)) s.classes.push(m[1]);
  }

  s.functions = [...new Set(s.functions)].slice(0, 20);
  s.classes = [...new Set(s.classes)].slice(0, 10);
  s.exports = [...new Set(s.exports)].slice(0, 15);
  s.routes = [...new Set(s.routes)].slice(0, 15);

  return s;
}

// Format a symbol summary line for a file — used in the repo map fed to the agent
export function formatSymbolSummary(path: string, symbols: FileSymbols): string {
  const lines: string[] = [];
  if (symbols.classes.length) lines.push(`  classes: ${symbols.classes.join(", ")}`);
  if (symbols.routes.length) lines.push(`  routes: ${symbols.routes.join(", ")}`);
  if (symbols.functions.length) lines.push(`  fns: ${symbols.functions.join(", ")}`);
  else if (symbols.exports.length) lines.push(`  exports: ${symbols.exports.join(", ")}`);
  return lines.join("\n");
}
