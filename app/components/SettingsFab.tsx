"use client";

import { useEffect, useRef, useState } from "react";
import { KeyWindow } from "./KeyWindow";
import { storage } from "@/app/lib/storage";

export function SettingsFab() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
          ⚙
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
}: {
  icon: string;
  label: string;
  onClick: () => void;
  divider?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 14px",
        background: hovered ? "var(--color-ember-elevated)" : "transparent",
        borderTop: divider ? "1px solid var(--color-ember-ash)" : "none",
        borderRight: "none",
        borderBottom: "none",
        borderLeft: "none",
        color: hovered ? "var(--color-ember-amber)" : "var(--color-ember-text)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        letterSpacing: "0.04em",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}
