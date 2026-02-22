"use client";

import { useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { FireAnimation } from "./FireAnimation";
import { storage } from "@/app/lib/storage";

interface ApiKeyModalProps {
  onKeySet: () => void;
}

export function ApiKeyModal({ onKeySet }: ApiKeyModalProps) {
  const [key, setKey] = useState("");
  const [phase, setPhase] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function validate(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return "This hearth is empty. Paste your API key.";
    if (!trimmed.startsWith("AIza"))
      return "Doesn't look like a Gemini key — should start with 'AIza'.";
    return null;
  }

  function handleSave() {
    const err = validate(key);
    if (err) {
      setErrorMsg(err);
      setPhase("error");
      return;
    }
    setPhase("saving");
    storage.setApiKey(key.trim());
    setTimeout(onKeySet, 350);
  }

  function handleChange(value: string) {
    setKey(value);
    if (phase === "error") {
      setPhase("idle");
      setErrorMsg("");
    }
  }

  return (
    <DraggableWindow title="MISSION_CONFIG.EXE" variant="fire" defaultWidth={460}>
      <div
        style={{
          padding: "32px 28px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {/* Fire */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <FireAnimation width={76} height={76} className="animate-flicker" />
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <h2
            className="animate-glow"
            style={{
              color: "var(--color-ember-amber)",
              fontSize: "1.05rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            No fire found.
          </h2>
          <p
            style={{
              color: "var(--color-ember-muted)",
              fontSize: "13px",
              lineHeight: "1.65",
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            This hearth needs fuel. Drop your Gemini API key below
            and I&apos;ll take it from here.
          </p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: "14px" }}>
          <label className="field-label" htmlFor="api-key-input">
            Gemini API Key
          </label>
          <input
            id="api-key-input"
            type="password"
            className="retro-input"
            placeholder="AIzaSy..."
            value={key}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            autoComplete="off"
          />
          {phase === "error" && <p className="field-error">{errorMsg}</p>}
        </div>

        {/* CTA */}
        <button
          className="btn-ignite"
          onClick={handleSave}
          disabled={phase === "saving"}
          style={{ width: "100%" }}
        >
          {phase === "saving" ? "Igniting..." : "IGNITE  →"}
        </button>

        {/* Footer notes */}
        <p
          style={{
            textAlign: "center",
            color: "var(--color-ember-dim)",
            fontSize: "11px",
            marginTop: "14px",
            lineHeight: "1.6",
          }}
        >
          Your key stays in your browser. Even I can&apos;t see it.
          <br />
          No account?{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--color-ember-amber)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Get one free at Google AI Studio →
          </a>
        </p>
      </div>
    </DraggableWindow>
  );
}
