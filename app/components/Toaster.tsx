"use client";

import { useEffect, useState } from "react";
import { subscribeToToasts, dismiss, type ToastItem } from "@/app/lib/toast";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 60, // leave room for the settings gear (34px + 10px gap)
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation on mount
    const enterRaf = requestAnimationFrame(() => setVisible(true));

    // Start leave animation slightly before the toast is actually dismissed
    const leaveTimer = setTimeout(() => setLeaving(true), toast.duration - 600);

    return () => {
      cancelAnimationFrame(enterRaf);
      clearTimeout(leaveTimer);
    };
  }, [toast.duration]);

  const colors = {
    fire: {
      bg: "rgba(30, 20, 10, 0.96)",
      border: "var(--color-ember-amber)",
      icon: "🔥",
      text: "var(--color-ember-amber)",
      glow: "0 0 18px rgba(255, 140, 30, 0.25), 0 4px 16px rgba(0,0,0,0.6)",
    },
    error: {
      bg: "rgba(25, 10, 10, 0.96)",
      border: "var(--color-ember-coral, #FF6B6B)",
      icon: "💀",
      text: "var(--color-ember-coral, #FF6B6B)",
      glow: "0 0 18px rgba(255, 80, 80, 0.2), 0 4px 16px rgba(0,0,0,0.6)",
    },
    info: {
      bg: "rgba(20, 20, 22, 0.96)",
      border: "var(--color-ember-ash)",
      icon: "◈",
      text: "var(--color-ember-muted)",
      glow: "0 4px 16px rgba(0,0,0,0.55)",
    },
  }[toast.type];

  return (
    <div
      onClick={onDismiss}
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 14px 10px 12px",
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 6,
        maxWidth: 320,
        boxShadow: colors.glow,
        fontFamily: "var(--font-mono)",
        cursor: "pointer",
        userSelect: "none",
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? "translateX(0)" : "translateX(18px)",
        transition: leaving
          ? "opacity 0.5s ease, transform 0.5s ease"
          : "opacity 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 14, flexShrink: 0, lineHeight: "1.4" }}>{colors.icon}</span>

      {/* Message */}
      <span
        style={{
          fontSize: 11,
          lineHeight: 1.55,
          letterSpacing: "0.03em",
          color: colors.text,
        }}
      >
        {toast.message}
      </span>

      {/* Dismiss x */}
      <span
        style={{
          marginLeft: "auto",
          paddingLeft: 8,
          color: "var(--color-ember-dim)",
          fontSize: 10,
          flexShrink: 0,
          lineHeight: "1.4",
          alignSelf: "center",
        }}
      >
        ✕
      </span>
    </div>
  );
}
