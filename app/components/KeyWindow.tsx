"use client";

import { useState } from "react";
import { DraggableWindow } from "./DraggableWindow";

interface KeyWindowProps {
  title: string;
  label: string;
  placeholder: string;
  initialValue: string;
  validate: (value: string) => string | null;
  onSave: (value: string) => void;
  onClose: () => void;
  helpLink?: { href: string; text: string };
}

export function KeyWindow({
  title,
  label,
  placeholder,
  initialValue,
  validate,
  onSave,
  onClose,
  helpLink,
}: KeyWindowProps) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "error" | "saved">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [tickHovered, setTickHovered] = useState(false);

  function handleCommit() {
    const err = validate(value);
    if (err) {
      setErrorMsg(err);
      setStatus("error");
      return;
    }
    onSave(value.trim());
    setStatus("saved");
  }

  function handleChange(v: string) {
    setValue(v);
    if (status !== "idle") {
      setStatus("idle");
      setErrorMsg("");
    }
  }

  const saved = status === "saved";

  return (
    <DraggableWindow
      title={title}
      variant="dark"
      defaultWidth={400}
      onClose={onClose}
      zIndex={50}
      titleAlign="right"
    >
      <div style={{ padding: "20px 20px 18px" }}>
        <label
          className="field-label"
          htmlFor={`key-input-${title}`}
          style={{ display: "block", marginBottom: 6 }}
        >
          {label}
        </label>

        {/* Input + tick button row */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            id={`key-input-${title}`}
            type="password"
            className="retro-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommit()}
            autoComplete="off"
            style={{ flex: 1 }}
          />

          {/* Tick / save button */}
          <button
            onClick={handleCommit}
            onMouseEnter={() => setTickHovered(true)}
            onMouseLeave={() => setTickHovered(false)}
            aria-label="Save"
            title="Save"
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: 3,
              border: saved
                ? "1px solid #4ADE80"
                : tickHovered
                  ? "1px solid var(--color-ember-amber)"
                  : "1px solid var(--color-ember-ash)",
              background: saved
                ? "rgba(74,222,128,0.08)"
                : "var(--color-ember-smoke)",
              color: saved
                ? "#4ADE80"
                : tickHovered
                  ? "var(--color-ember-amber)"
                  : "var(--color-ember-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s, background 0.2s",
            }}
          >
            {saved ? "✓" : "↵"}
          </button>
        </div>

        {status === "error" && (
          <p className="field-error" style={{ marginTop: 6 }}>
            {errorMsg}
          </p>
        )}

        {helpLink && (
          <p
            style={{
              color: "var(--color-ember-dim)",
              fontSize: 11,
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            No key?{" "}
            <a
              href={helpLink.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-ember-amber)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {helpLink.text}
            </a>
          </p>
        )}
      </div>
    </DraggableWindow>
  );
}
