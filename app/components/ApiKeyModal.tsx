"use client";

import { useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { FireAnimation } from "./FireAnimation";
import { storage } from "@/app/lib/storage";
import { toast } from "@/app/lib/toast";

interface ApiKeyModalProps {
  onKeySet: () => void;
}

// Quick validation — try listing Gemini models with the provided key
async function validateGeminiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function ApiKeyModal({ onKeySet }: ApiKeyModalProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [githubKey, setGithubKey] = useState("");
  const [phase, setPhase] = useState<"idle" | "validating" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function formatCheck(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return "This hearth is empty. Paste your Gemini API key.";
    if (!trimmed.startsWith("AIza"))
      return "Doesn't look like a Gemini key — should start with 'AIza'.";
    return null;
  }

  async function handleSave() {
    const formatErr = formatCheck(geminiKey);
    if (formatErr) {
      setErrorMsg(formatErr);
      setPhase("error");
      return;
    }

    setPhase("validating");

    const valid = await validateGeminiKey(geminiKey.trim());

    if (!valid) {
      setPhase("error");
      setErrorMsg("Key rejected by Gemini API. Double-check it and try again.");
      toast.error("Your API key isn't igniting. Check it and try again.");
      return;
    }

    // Save both keys
    storage.setApiKey(geminiKey.trim());
    if (githubKey.trim()) {
      storage.setGithubKey(githubKey.trim());
    }

    // Nudge user toward model selection
    toast.fire("Fuel loaded. Pick your model in ⚙ Settings → Choose Model");

    setTimeout(onKeySet, 300);
  }

  function handleGeminiChange(value: string) {
    setGeminiKey(value);
    if (phase === "error") {
      setPhase("idle");
      setErrorMsg("");
    }
  }

  const isValidating = phase === "validating";

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

        {/* Gemini key */}
        <div style={{ marginBottom: "12px" }}>
          <label className="field-label" htmlFor="api-key-input">
            Gemini API Key
          </label>
          <input
            id="api-key-input"
            type="password"
            className="retro-input"
            placeholder="AIzaSy..."
            value={geminiKey}
            onChange={(e) => handleGeminiChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            autoComplete="off"
            disabled={isValidating}
          />
          {phase === "error" && <p className="field-error">{errorMsg}</p>}
        </div>

        {/* GitHub key — optional */}
        <div style={{ marginBottom: "18px" }}>
          <label className="field-label" htmlFor="github-key-input">
            GitHub Token{" "}
            <span
              style={{
                color: "var(--color-ember-dim)",
                fontSize: "10px",
                letterSpacing: "0.04em",
                textTransform: "none",
                fontWeight: 400,
              }}
            >
              — optional, unlocks private repos &amp; higher rate limits
            </span>
          </label>
          <input
            id="github-key-input"
            type="password"
            className="retro-input"
            placeholder="ghp_..."
            value={githubKey}
            onChange={(e) => setGithubKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoComplete="off"
            disabled={isValidating}
          />
        </div>

        {/* CTA */}
        <button
          className="btn-ignite"
          onClick={handleSave}
          disabled={isValidating}
          style={{ width: "100%" }}
        >
          {isValidating ? "Igniting..." : "IGNITE  →"}
        </button>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: "var(--color-ember-dim)",
            fontSize: "11px",
            marginTop: "14px",
            lineHeight: "1.6",
          }}
        >
          Your keys stay in your browser. Even I can&apos;t see them.
          <br />
          No Gemini key?{" "}
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
