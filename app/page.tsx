"use client";

import { useEffect, useRef, useState } from "react";
import { storage } from "@/app/lib/storage";
import { MOCK_RESULT } from "@/app/lib/mock";
import { ApiKeyModal } from "@/app/components/ApiKeyModal";
import { MainApp } from "@/app/components/MainApp";
import { ProgressView } from "@/app/components/ProgressView";
import { OutputView } from "@/app/components/OutputView";
import { SettingsFab } from "@/app/components/SettingsFab";
import type { AppPhase, AnalysisMode, AgentResult } from "@/app/lib/types";

interface AppState {
  phase: AppPhase;
  result?: AgentResult;
  error?: string;
}

export default function Home() {
  // "loading" avoids SSR / client hydration mismatch with localStorage
  const [state, setState] = useState<AppState>({ phase: "loading" });

  // Store the pending request so the real agent can pick it up later
  const pendingRef = useRef<{
    url: string;
    mode: AnalysisMode;
    focus: string;
  } | null>(null);

  // Read localStorage only after mount (client-only)
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const phase = storage.hasApiKey() ? "main" : "setup";
    // One-time mount read from localStorage (browser-only API).
    // This is intentional — it cannot be expressed as a subscription.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, phase }));
  }, []);

  function handleKeySet() {
    setState((prev) => ({ ...prev, phase: "main" }));
  }

  function handleIgnite(url: string, mode: AnalysisMode, focus: string) {
    pendingRef.current = { url, mode, focus };
    // TODO: wire real agent – pendingRef.current holds url / mode / focus
    setState((prev) => ({ ...prev, phase: "processing" }));
  }

  function handleMockComplete() {
    setState({ phase: "output", result: MOCK_RESULT });
  }

  function handleReset() {
    pendingRef.current = null;
    setState({ phase: "main" });
  }

  /* ── Loading splash ── */
  if (state.phase === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="animate-flicker"
          style={{
            color: "var(--color-ember-amber)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.55,
          }}
        >
          Warming up...
        </span>
      </div>
    );
  }

  return (
    <>
      {state.phase !== "setup" && <SettingsFab />}

      {state.phase === "setup" && <ApiKeyModal onKeySet={handleKeySet} />}

      {state.phase === "main" && <MainApp onIgnite={handleIgnite} />}

      {state.phase === "processing" && (
        <ProgressView onMockComplete={handleMockComplete} />
      )}

      {state.phase === "output" && state.result && (
        <OutputView result={state.result} onReset={handleReset} />
      )}

      {state.phase === "error" && (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "var(--color-ember-coral)",
              fontSize: "13px",
              maxWidth: "400px",
            }}
          >
            {state.error ?? "Something went wrong. The fire went out."}
          </p>
          <button className="btn-ghost" onClick={handleReset}>
            ← Try again
          </button>
        </div>
      )}
    </>
  );
}
