"use client";

import { useEffect, useRef, useCallback } from "react";

const COLORS = [
  "#FF4466", "#FF6B2B", "#FFD700", "#39FF14",
  "#00FFFF", "#0099FF", "#CC44FF", "#FF44CC",
  "#FF8C00", "#7FFF00", "#FF1493", "#00BFFF",
  "#ADFF2F", "#FF6347", "#DA70D6", "#40E0D0",
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface TrailPoint { x: number; y: number; }

interface Rocket {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  speed: number;
  trail: TrailPoint[];
  done: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

export function FireworksOverlay({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rockets = useRef<Rocket[]>([]);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(active);

  useEffect(() => { activeRef.current = active; }, [active]);

  const explode = useCallback((x: number, y: number, color: string) => {
    const count = 28 + Math.floor(Math.random() * 14); // 28–42 dots
    const altColor = randItem(COLORS);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = rand(2.2, 5.8);
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? color : altColor,
        alpha: 1,
        size: rand(2, 4.5),
      });
    }
  }, []);

  const spawnRocket = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const color = randItem(COLORS);
    rockets.current.push({
      x: rand(w * 0.1, w * 0.9),
      y: h + 10,
      targetX: rand(w * 0.1, w * 0.9),
      targetY: rand(h * 0.08, h * 0.5),
      color,
      speed: rand(9, 15),
      trail: [],
      done: false,
    });
  }, []);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      if (!canvas || !ctx) return;

      // Clear to transparent — fireworks sit over the app background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Rockets ──────────────────────────────────────────────────────
      rockets.current = rockets.current.filter((r) => {
        if (r.done) return false;

        const dx = r.targetX - r.x;
        const dy = r.targetY - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Reached target → explode
        if (dist < r.speed) {
          r.done = true;
          explode(r.targetX, r.targetY, r.color);
          return false;
        }

        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 10) r.trail.shift();

        r.x += (dx / dist) * r.speed;
        r.y += (dy / dist) * r.speed;

        // Draw trail (fades from transparent to opaque toward head)
        r.trail.forEach((pt, i) => {
          const a = (i / r.trail.length) * 0.7;
          const hex = Math.floor(a * 255).toString(16).padStart(2, "0");
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = r.color + hex;
          ctx.fill();
        });

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      // ── Particles ─────────────────────────────────────────────────────
      particles.current = particles.current.filter((p) => {
        p.vx *= 0.975;        // air resistance
        p.vy *= 0.975;
        p.vy += 0.07;         // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.014;

        if (p.alpha <= 0) return false;

        const hex = Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + hex;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2.5;
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [explode]);

  // Rocket scheduling while active
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      return;
    }

    // Burst right away
    spawnRocket();
    setTimeout(spawnRocket, 300);
    setTimeout(spawnRocket, 700);

    // Recurring launches with randomised timing
    function scheduleNext() {
      spawnRocket();
      if (Math.random() > 0.4) setTimeout(spawnRocket, rand(150, 350));
      intervalRef.current = setTimeout(scheduleNext, rand(1000, 2200));
    }
    intervalRef.current = setTimeout(scheduleNext, rand(1200, 2000));

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [active, spawnRocket]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
      }}
    />
  );
}
