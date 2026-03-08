"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Pixel unit size ───────────────────────────────────────────────────────────
const PX = 4;

// ── Ember palette [r, g, b] ───────────────────────────────────────────────────
const C: Record<string, [number, number, number]> = {
  a: [255, 175, 0],   // amber
  o: [255, 105, 0],   // orange
  c: [235,  50, 20],  // coral
  d: [175, 115, 0],   // dim
  w: [255, 220, 120], // bright (for eyes, highlights)
};

// ── 5×5 pixel font ────────────────────────────────────────────────────────────
const FONT5: Record<string, string[]> = {
  A: ["aaaaa","a   a","aaaaa","a   a","a   a"],
  B: ["aaaa ","a   a","aaaa ","a   a","aaaa "],
  C: ["aaaaa","a    ","a    ","a    ","aaaaa"],
  D: ["aaaa ","a   a","a   a","a   a","aaaa "],
  E: ["aaaaa","a    ","aaaa ","a    ","aaaaa"],
  F: ["aaaaa","a    ","aaaa ","a    ","a    "],
  G: ["aaaaa","a    ","a aaa","a   a","aaaaa"],
  H: ["a   a","a   a","aaaaa","a   a","a   a"],
  I: [" aaa "," a   "," a   "," a   "," aaa "],
  K: ["a   a","a  a ","aaa  ","a  a ","a   a"],
  M: ["a   a","aa aa","a a a","a   a","a   a"],
  N: ["a   a","aa  a","a a a","a  aa","a   a"],
  O: ["aaaaa","a   a","a   a","a   a","aaaaa"],
  P: ["aaaa ","a   a","aaaa ","a    ","a    "],
  R: ["aaaa ","a   a","aaaa ","a  a ","a   a"],
  S: ["aaaaa","a    ","aaaaa","    a","aaaaa"],
  T: ["aaaaa"," a   "," a   "," a   "," a   "],
  U: ["a   a","a   a","a   a","a   a","aaaaa"],
  X: ["a   a"," a a ","  a  "," a a ","a   a"],
};

function makeWord(text: string): string[] {
  const chars = text.toUpperCase().split("").map((ch) => FONT5[ch] ?? Array(5).fill("     "));
  return Array.from({ length: 5 }, (_, r) => chars.map((g) => g[r]).join(" "));
}

// ── Sprite definitions ────────────────────────────────────────────────────────
const SPRITES_DEF: { id: string; grid: string[] }[] = [
  // Calcifer flame
  {
    id: "flame",
    grid: [
      "   a   ",
      "  aoa  ",
      " aoooa ",
      "aoooaoa",
      "aoccaoa",
      " accca ",
      "  acca ",
      "   aa  ",
    ],
  },
  // Bigger flame (Calcifer burning)
  {
    id: "flame2",
    grid: [
      "  a  a  ",
      " aoa aoa",
      "aoooaooa",
      "aoooooca",
      "aoccocca",
      " acccca ",
      "  accca ",
      "   aaa  ",
    ],
  },
  // Repo folder
  {
    id: "folder",
    grid: [
      "aaaa    ",
      "aaaaaaaa",
      "a      a",
      "a  dd  a",
      "a  dd  a",
      "aaaaaaaa",
    ],
  },
  // Bug / beetle
  {
    id: "bug",
    grid: [
      "o     o",
      " ooooo ",
      "ooccooo",
      "ooccooo",
      " ooooo ",
      "o     o",
    ],
  },
  // Code file
  {
    id: "file",
    grid: [
      "aaaaa  ",
      "aoooo  ",
      "aaaaaaa",
      "a ddd a",
      "a ddd a",
      "a     a",
      "aaaaaaa",
    ],
  },
  // Star
  {
    id: "star",
    grid: [
      "   a   ",
      " aaaaa ",
      "aaaaaaa",
      " aaaaa ",
      "   a   ",
    ],
  },
  // Terminal
  {
    id: "term",
    grid: [
      "aaaaaaaaa",
      "ao       ",
      "ao oo    ",
      "ao  ooooo",
      "ao       ",
      "aaaaaaaaa",
    ],
  },
  // Magnifying glass
  {
    id: "search",
    grid: [
      " aaaa ",
      "aooooa",
      "ao ooa",
      "aooooa",
      " aaaa ",
      "    aa",
      "     a",
    ],
  },
  // Git commit circle
  {
    id: "commit",
    grid: [
      " aaa ",
      "aoooa",
      "aoooa",
      "aoooa",
      " aaa ",
    ],
  },
  // Code brackets < >
  {
    id: "brackets",
    grid: [
      "  a   a  ",
      " aa   aa ",
      "aa     aa",
      " aa   aa ",
      "  a   a  ",
    ],
  },
  // Lightning bolt (fast/energy)
  {
    id: "bolt",
    grid: [
      "  aaa",
      "  aa ",
      " aaa ",
      "aaa  ",
      " aa  ",
      " a   ",
    ],
  },
  // Git fork (Y-shape)
  {
    id: "fork",
    grid: [
      "a     a",
      "aa   aa",
      " aa aa ",
      "  aaa  ",
      "   a   ",
      "   a   ",
      "  aaa  ",
    ],
  },
  // Git merge (two lines merging)
  {
    id: "merge",
    grid: [
      "aa  aa ",
      " a  a  ",
      " aa a  ",
      "  aaa  ",
      "   a   ",
      "   a   ",
      "  aaa  ",
    ],
  },
  // Warning / exclamation triangle
  {
    id: "warn",
    grid: [
      "   a   ",
      "  aaa  ",
      " ao oa ",
      " ao oa ",
      "aooaooa",
      "aaaaaaa",
    ],
  },
  // Checkmark / done
  {
    id: "check",
    grid: [
      "      a",
      "     aa",
      "a   aa ",
      "aa aa  ",
      " aaa   ",
      "  a    ",
    ],
  },
  // Coffee mug (hacker fuel)
  {
    id: "coffee",
    grid: [
      " a     ",
      "  a    ",
      "aaaaaaa",
      "a     a",
      "a     aa",
      "a     a",
      " aaaaa ",
      "aaaaaaa",
    ],
  },
  // Calcifer eye / orb
  {
    id: "eye",
    grid: [
      " wwwww ",
      "waoooaw",
      "waccsaw",  // using s as alias... let's use c
      "waoooaw",
      " wwwww ",
    ],
  },
  // Crown
  {
    id: "crown",
    grid: [
      "a     a",
      "a  a  a",
      "a a a a",
      "aaaaaaa",
      "aaaaaaa",
    ],
  },
  // Pull request arrows
  {
    id: "pr",
    grid: [
      " a   a ",
      "aa   aa",
      "a ooo a",
      "  ooo  ",
      " aoooa ",
      "  aaa  ",
    ],
  },
  // Document / report output
  {
    id: "doc",
    grid: [
      "aaaaaaa",
      "a      ",
      "a dddda",
      "a dddda",
      "a dddda",
      "a      ",
      "aaaaaaa",
    ],
  },
  // GitHub octocat (simplified)
  {
    id: "octo",
    grid: [
      " aaaaa ",
      "aaaaaaa",
      "aaoaoaa",
      "aaaaaaa",
      " aa aa ",
      " a   a ",
    ],
  },
  // Burning GitHub (octo on fire)
  {
    id: "octofire",
    grid: [
      " a ooa ",
      "aaaoaaa",
      "aaaoaoa",
      "aaaaaaa",
      " aaaa  ",
      " a  a  ",
    ],
  },
  // Pixel text: PUSH
  { id: "txt_push", grid: makeWord("PUSH") },
  // Pixel text: MERGE
  { id: "txt_merge", grid: makeWord("MERGE") },
  // Pixel text: FORK
  { id: "txt_fork", grid: makeWord("FORK") },
  // Pixel text: BUG
  { id: "txt_bug", grid: makeWord("BUG") },
  // Pixel text: FIX
  { id: "txt_fix", grid: makeWord("FIX") },
  // Pixel text: CODE
  { id: "txt_code", grid: makeWord("CODE") },
];

// ── Compiled sprite ───────────────────────────────────────────────────────────
interface CompiledSprite {
  id: string;
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
}

function buildSprites(): CompiledSprite[] {
  return SPRITES_DEF.map(({ id, grid }) => {
    const rows = grid.length;
    const cols = Math.max(...grid.map((r) => r.length));
    const w = cols * PX;
    const h = rows * PX;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d")!;
    grid.forEach((row, ry) => {
      for (let cx = 0; cx < row.length; cx++) {
        const rgb = C[row[cx]];
        if (!rgb) continue;
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        ctx.fillRect(cx * PX, ry * PX, PX, PX);
      }
    });
    return { id, canvas: off, w, h };
  });
}

// ── Lane config ───────────────────────────────────────────────────────────────
interface LaneDef {
  yFrac: number;
  speed: number;
  ids: string[];
  spacing: number;
  alpha: number;  // base lane alpha (scaled by master)
  scale: number;
}

const LANE_DEFS: LaneDef[] = [
  { yFrac: 0.05, speed: 24, ids: ["flame","txt_push","star","commit","bolt"],            spacing: 240, alpha: 0.9, scale: 1.0  },
  { yFrac: 0.18, speed: 16, ids: ["folder","file","doc","octo","txt_merge"],             spacing: 295, alpha: 0.75, scale: 1.3  },
  { yFrac: 0.31, speed: 36, ids: ["bug","warn","brackets","fork","txt_bug"],             spacing: 200, alpha: 0.95, scale: 0.8  },
  { yFrac: 0.44, speed: 20, ids: ["flame2","octofire","star","pr","txt_fork"],           spacing: 270, alpha: 0.8, scale: 1.15 },
  { yFrac: 0.57, speed: 31, ids: ["term","search","commit","merge","txt_code"],         spacing: 210, alpha: 0.85, scale: 0.9  },
  { yFrac: 0.70, speed: 14, ids: ["file","brackets","coffee","crown","txt_fix"],         spacing: 315, alpha: 0.7, scale: 1.4  },
  { yFrac: 0.82, speed: 42, ids: ["star","bolt","octo","check","txt_push"],              spacing: 180, alpha: 0.9, scale: 0.75 },
  { yFrac: 0.93, speed: 26, ids: ["eye","flame","fork","warn","doc"],                    spacing: 255, alpha: 0.8, scale: 1.05 },
];

interface Lane extends LaneDef { offset: number }

// ── Component ─────────────────────────────────────────────────────────────────
export function PixelParadeBackground({ processing }: { processing: boolean }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const spritesRef   = useRef<CompiledSprite[]>([]);
  const lanesRef     = useRef<Lane[]>([]);
  const lastTRef     = useRef<number>(0);
  const rafRef       = useRef<number>(0);
  // current master alpha (lerped toward target each frame)
  const masterRef    = useRef<number>(0.28);
  // pulse phase (advances when processing)
  const pulseRef     = useRef<number>(0);
  // track processing state inside the rAF loop
  const procRef      = useRef<boolean>(processing);

  useEffect(() => { procRef.current = processing; }, [processing]);

  const frame = useCallback((t: number) => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx || spritesRef.current.length === 0) {
      rafRef.current = requestAnimationFrame(frame);
      return;
    }

    const dt = Math.min((t - lastTRef.current) / 1000, 0.1);
    lastTRef.current = t;

    const isProc    = procRef.current;
    const targetMaster = isProc ? 1.0 : 0.28;
    // lerp master alpha
    masterRef.current += (targetMaster - masterRef.current) * Math.min(dt * 1.8, 1);
    const master = masterRef.current;

    // advance pulse phase when processing
    if (isProc) pulseRef.current += dt * 0.45; // ~0.45 rad/s → ~14s full cycle

    // pulse multiplier: oscillates 0.75–1.0 slow and smooth
    const pulse = isProc
      ? 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(pulseRef.current * Math.PI * 2))
      : 1.0;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // subtle orange glow overlay when processing
    if (isProc) {
      const glowAmt = 0.032 * (0.5 + 0.5 * Math.sin(pulseRef.current * Math.PI * 2));
      ctx.fillStyle = `rgba(255,90,0,${(glowAmt * master).toFixed(4)})`;
      ctx.fillRect(0, 0, W, H);
    }

    const spriteMap = new Map(spritesRef.current.map((s) => [s.id, s]));

    for (const lane of lanesRef.current) {
      lane.offset = (lane.offset + lane.speed * dt) % lane.spacing;

      const cy = lane.yFrac * H;
      let slotIdx = 0;
      let x = -lane.offset;

      while (x < W + 400) {
        const sprite = spriteMap.get(lane.ids[slotIdx % lane.ids.length]);
        if (sprite) {
          const sw = sprite.w * lane.scale;
          const sh = sprite.h * lane.scale;
          if (x + sw > 0) {
            ctx.globalAlpha = lane.alpha * master * pulse * 0.14; // 0.14 = base opacity ceiling
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite.canvas, Math.round(x), Math.round(cy - sh / 2), Math.round(sw), Math.round(sh));
            ctx.globalAlpha = 1;
          }
        }
        x += lane.spacing;
        slotIdx++;
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    spritesRef.current = buildSprites();
    lanesRef.current   = LANE_DEFS.map((def) => ({ ...def, offset: Math.random() * def.spacing }));

    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    lastTRef.current = performance.now();
    rafRef.current   = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [frame]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        imageRendering: "pixelated",
      }}
    />
  );
}
