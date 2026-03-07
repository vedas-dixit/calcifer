"use client";

import { useEffect, useRef, useState } from "react";
import { KeyWindow } from "./KeyWindow";
import { ModelPickerWindow } from "./ModelPickerWindow";
import { storage } from "@/app/lib/storage";

export function SettingsFab() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Read key state once on mount (client-only)
  useEffect(() => {
    setHasGeminiKey(storage.hasApiKey());
  }, []);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openGemini() {
    setDropdownOpen(false);
    setGeminiOpen(true);
  }

  function openGithub() {
    setDropdownOpen(false);
    setGithubOpen(true);
  }

  function openModel() {
    if (!hasGeminiKey) return;
    setDropdownOpen(false);
    setModelOpen(true);
  }

  return (
    <>
      {/* FAB + dropdown */}
      <div
        ref={wrapperRef}
        style={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}
      >
        {/* Gear button */}
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          aria-label="Settings"
          title="Settings"
          style={{
            width: 34,
            height: 34,
            borderRadius: 6,
            border: "1px solid var(--color-ember-ash)",
            background: dropdownOpen
              ? "var(--color-ember-elevated)"
              : "var(--color-ember-surface)",
            color: dropdownOpen
              ? "var(--color-ember-amber)"
              : "var(--color-ember-muted)",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
            fontFamily: "var(--font-mono)",
            transition: "border-color 0.2s, color 0.2s, background 0.2s",
            borderColor: dropdownOpen
              ? "var(--color-ember-amber)"
              : "var(--color-ember-ash)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "var(--color-ember-surface)",
              border: "1px solid var(--color-ember-ash)",
              borderRadius: 6,
              minWidth: 190,
              boxShadow: "0 8px 24px rgba(0,0,0,0.55)",
              overflow: "hidden",
              animation: "modal-pop 0.15s ease-out both",
            }}
          >
            <DropdownItem icon="🔑" label="Set Gemini Key" onClick={openGemini} />
            <DropdownItem icon="🐙" label="Set GitHub Key" onClick={openGithub} divider />
            <DropdownItem
              icon="⚡"
              label="Choose Model"
              onClick={openModel}
              divider
              disabled={!hasGeminiKey}
              disabledHint="Add a Gemini key first"
            />
          </div>
        )}
      </div>

      {geminiOpen && (
        <KeyWindow
          title="GEMINI_KEY.EXE"
          label="Gemini API Key"
          placeholder="AIzaSy..."
          initialValue={storage.getApiKey() ?? ""}
          validate={(v) => {
            if (!v.trim()) return "Key cannot be empty.";
            if (!v.trim().startsWith("AIza")) return "Should start with 'AIza'.";
            return null;
          }}
          onSave={(v) => storage.setApiKey(v)}
          onClose={() => setGeminiOpen(false)}
          helpLink={{
            href: "https://aistudio.google.com/app/apikey",
            text: "Get one free at Google AI Studio →",
          }}
        />
      )}

      {modelOpen && (
        <ModelPickerWindow
          apiKey={storage.getApiKey()!}
          onClose={() => setModelOpen(false)}
        />
      )}

      {githubOpen && (
        <KeyWindow
          title="GITHUB_KEY.EXE"
          label="GitHub Personal Access Token"
          placeholder="ghp_..."
          initialValue={storage.getGithubKey() ?? ""}
          validate={(v) => {
            if (!v.trim()) return "Token cannot be empty.";
            return null;
          }}
          onSave={(v) => storage.setGithubKey(v)}
          onClose={() => setGithubOpen(false)}
          helpLink={{
            href: "https://github.com/settings/tokens",
            text: "Create one at GitHub Settings →",
          }}
        />
      )}
    </>
  );
}

/* ── Dropdown item ── */
function DropdownItem({
  icon,
  label,
  onClick,
  divider,
  disabled,
  disabledHint,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={disabled && disabledHint ? disabledHint : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 14px",
        background: !disabled && hovered ? "var(--color-ember-elevated)" : "transparent",
        borderTop: divider ? "1px solid var(--color-ember-ash)" : "none",
        borderRight: "none",
        borderBottom: "none",
        borderLeft: "none",
        color: disabled
          ? "var(--color-ember-dim)"
          : hovered
            ? "var(--color-ember-amber)"
            : "var(--color-ember-text)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        letterSpacing: "0.04em",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}
