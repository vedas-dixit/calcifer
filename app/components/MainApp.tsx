"use client";

import { useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { FireAnimation } from "./FireAnimation";
import type { AnalysisMode } from "@/app/lib/types";

interface MainAppProps {
  onIgnite: (url: string, mode: AnalysisMode, focus: string) => void;
}

interface ModeOption {
  id: AnalysisMode;
  icon: string;
  label: string;
  description: string;
}

const MODES: ModeOption[] = [
  {
    id: "documentation",
    icon: "📄",
    label: "Full Documentation",
    description: "Architecture overview · module breakdown · getting started guide",
  },
  {
    id: "contribution",
    icon: "🤝",
    label: "Contribution Guide",
    description: "Good first issues · codebase entry points · contribution patterns",
  },
  {
    id: "bugs",
    icon: "🔍",
    label: "Bug Hunt",
    description: "Potential issues · weak spots · code smells",
  },
];

export function MainApp({ onIgnite }: MainAppProps) {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("documentation");
  const [focus, setFocus] = useState("");
  const [urlError, setUrlError] = useState("");

  function handleIgnite() {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Feed me a GitHub URL first.");
      return;
    }
    if (!trimmed.includes("github.com")) {
      setUrlError("Has to be a GitHub URL. I only speak GitHub.");
      return;
    }
    setUrlError("");
    onIgnite(trimmed, mode, focus.trim());
  }

  return (
    <DraggableWindow
      title="MISSION_CONFIG.EXE"
      defaultWidth={560}
      titleAlign="right"
    >
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FireAnimation width={64} height={64} className="animate-flicker" />

          <h1
            className="fire-glow animate-glow"
            style={{
              color: "var(--color-ember-amber)",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              margin: "4px 0 6px",
            }}
          >
            EMBERCORE
          </h1>

          <p
            style={{
              color: "var(--color-ember-muted)",
              fontSize: "12.5px",
              letterSpacing: "0.06em",
            }}
          >
            Feed me a repo. I&apos;ll light the way.
          </p>
        </div>

        {/* URL */}
        <div style={{ marginBottom: "20px" }}>
          <label className="field-label" htmlFor="repo-url">
            GitHub Repository URL
          </label>
          <input
            id="repo-url"
            type="url"
            className="retro-input"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleIgnite()}
            autoFocus
          />
          {urlError && <p className="field-error">{urlError}</p>}
        </div>

        {/* Mode */}
        <div style={{ marginBottom: "20px" }}>
          <label className="field-label">What should I cook?</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {MODES.map((m) => (
              <div
                key={m.id}
                className={`radio-card ${mode === m.id ? "is-selected" : ""}`}
                onClick={() => setMode(m.id)}
                role="radio"
                aria-checked={mode === m.id}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && setMode(m.id)
                }
              >
                <div className="radio-dot">
                  <div className="radio-dot-inner" />
                </div>
                <div>
                  <div
                    style={{
                      color:
                        mode === m.id
                          ? "var(--color-ember-text)"
                          : "var(--color-ember-muted)",
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "2px",
                      transition: "color 0.2s",
                    }}
                  >
                    {m.icon}&nbsp;&nbsp;{m.label}
                  </div>
                  <div
                    style={{
                      color: "var(--color-ember-dim)",
                      fontSize: "11px",
                      lineHeight: "1.5",
                    }}
                  >
                    {m.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus area */}
        <div style={{ marginBottom: "24px" }}>
          <label className="field-label" htmlFor="focus-area">
            Specific focus area
            <span
              style={{
                textTransform: "none",
                letterSpacing: 0,
                fontWeight: 400,
                marginLeft: "6px",
                color: "var(--color-ember-dim)",
              }}
            >
              — optional
            </span>
          </label>
          <input
            id="focus-area"
            type="text"
            className="retro-input"
            placeholder="e.g., frontend only, auth module, API routes..."
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
        </div>

        {/* Ignite */}
        <button
          className="btn-ignite"
          onClick={handleIgnite}
          style={{ width: "100%" }}
        >
          🔥&nbsp;&nbsp;IGNITE
        </button>

        <p
          style={{
            textAlign: "center",
            color: "var(--color-ember-dim)",
            fontSize: "11px",
            marginTop: "10px",
            letterSpacing: "0.02em",
          }}
        >
          ~60 seconds &middot; uses your Gemini key &middot; public repos only
        </p>
      </div>
    </DraggableWindow>
  );
}
