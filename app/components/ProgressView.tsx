"use client";

import { useEffect, useRef, useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { FireAnimation } from "./FireAnimation";
import { MOCK_STEPS } from "@/app/lib/mock";
import type { StepLog, AgentProgress } from "@/app/lib/types";

interface ProgressViewProps {
  /** When provided, renders live progress from the real agent. */
  live?: AgentProgress;
  /** Called after the mock animation completes (demo mode). */
  onMockComplete?: () => void;
}

/* Time between each step appearing (ms) — feels snappy but not instant */
const STEP_DELAY = 900;

export function ProgressView({ live, onMockComplete }: ProgressViewProps) {
  const [visibleSteps, setVisibleSteps] = useState<StepLog[]>([]);
  const [percent, setPercent] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Demo / mock mode ── */
  useEffect(() => {
    if (live) return;

    let idx = 0;

    function tick() {
      if (idx >= MOCK_STEPS.length) {
        onMockComplete?.();
        return;
      }

      const raw = MOCK_STEPS[idx];
      const step: StepLog = { ...raw, status: "active" };

      setVisibleSteps((prev) => {
        const updated = prev.map((s) => ({ ...s, status: "complete" as const }));
        return [...updated, step];
      });

      setPercent(Math.round(((idx + 1) / MOCK_STEPS.length) * 100));
      idx++;
      timerRef.current = setTimeout(tick, STEP_DELAY);
    }

    timerRef.current = setTimeout(tick, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [live, onMockComplete]);

  /* ── Live agent mode ── */
  useEffect(() => {
    if (!live) return;
    setVisibleSteps(live.steps);
    setPercent(live.percent);
  }, [live]);

  /* ── Auto-scroll terminal to bottom ── */
  useEffect(() => {
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleSteps]);

  const currentStep = visibleSteps.at(-1);
  const isComplete = percent >= 100;

  return (
    <DraggableWindow
      title="MISSION.LOG"
      variant="dark"
      defaultWidth={600}
      headerRight={
        <span
          style={{
            color: "var(--color-ember-amber)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
          }}
        >
          {percent}%
        </span>
      }
    >
      {/* Sub-header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 22px 0",
        }}
      >
        <FireAnimation width={40} height={40} className="animate-flicker" />
        <div>
          <h2
            style={{
              color: "var(--color-ember-amber)",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            EMBERCORE
          </h2>
          <p
            style={{
              color: "var(--color-ember-muted)",
              fontSize: "11px",
              letterSpacing: "0.04em",
              marginTop: "2px",
            }}
          >
            {isComplete ? "Mission complete." : "Igniting..."}
          </p>
        </div>
      </div>

      {/* Terminal output */}
      <div className="terminal-body" ref={terminalRef} style={{ marginTop: "12px" }}>
        {visibleSteps.length === 0 && (
          <div className="term-line term-line--dim cursor-blink">
            Initializing...
          </div>
        )}

        {visibleSteps.map((step, i) => {
          const isActive = step.status === "active";
          const lineClass = isActive
            ? "term-line term-line--prompt animate-type-in"
            : "term-line";

          return (
            <div key={step.id} style={{ animationDelay: `${i * 0.02}s` }}>
              <div className={lineClass}>{step.message}</div>
              {step.sub && (
                <div
                  className="term-line term-line--sub animate-type-in"
                  style={{ animationDelay: `${i * 0.02 + 0.08}s` }}
                >
                  {step.sub}
                </div>
              )}
            </div>
          );
        })}

        {!isComplete && visibleSteps.length > 0 && (
          <div
            className="term-line term-line--dim cursor-blink"
            style={{ marginTop: "4px" }}
          />
        )}

        {isComplete && (
          <div
            className="term-line term-line--ok animate-type-in"
            style={{ marginTop: "8px" }}
          >
            ✓ Report ready.
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          padding: "14px 22px",
          borderTop: "1px solid var(--color-ember-ash)",
          background: "var(--color-ember-surface)",
        }}
      >
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
          }}
        >
          <span
            style={{
              color: "var(--color-ember-dim)",
              fontSize: "10px",
              letterSpacing: "0.06em",
            }}
          >
            {currentStep?.message.replace("> ", "").split("...")[0] ?? "Warming up"}
          </span>
          <span
            style={{
              color: isComplete ? "var(--color-ember-amber)" : "var(--color-ember-dim)",
              fontSize: "10px",
              letterSpacing: "0.06em",
              fontWeight: isComplete ? 600 : 400,
              transition: "color 0.3s",
            }}
          >
            {isComplete ? "Complete" : "Processing..."}
          </span>
        </div>
      </div>
    </DraggableWindow>
  );
}
