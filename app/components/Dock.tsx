"use client";

import { useState } from "react";
import { FireAnimation } from "./FireAnimation";

type Phase = "loading" | "idle" | "processing";

interface DockProps {
  phase: Phase;
  hasResult: boolean;
  progressAvailable: boolean;
  windows: { mission: boolean; progress: boolean; report: boolean };
  onCalciferClick: () => void;
  onProgressClick: () => void;
  onReportClick: () => void;
}

export function Dock({
  phase,
  hasResult,
  progressAvailable,
  windows,
  onCalciferClick,
  onProgressClick,
  onReportClick,
}: DockProps) {
  const isProcessing = phase === "processing";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        alignItems: "stretch",
        background: "rgba(26, 24, 25, 0.92)",
        border: "1px solid rgba(74, 68, 72, 0.65)",
        borderRadius: 18,
        padding: "6px 8px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
        gap: 2,
      }}
    >
      <DockItem
        label="CALCIFER"
        active={windows.mission}
        tooltip="Open mission config"
        onClick={onCalciferClick}
      >
        <FireAnimation width={34} height={34} showEyes />
      </DockItem>

      <div
        style={{
          width: 1,
          alignSelf: "stretch",
          margin: "8px 4px",
          background: "rgba(74, 68, 72, 0.5)",
          flexShrink: 0,
        }}
      />

      <DockItem
        label="MISSION.LOG"
        active={windows.progress}
        disabled={!progressAvailable}
        pulsing={isProcessing && !windows.progress}
        tooltip={progressAvailable ? "View progress log" : "No mission active"}
        onClick={onProgressClick}
      >
        <TerminalIcon
          color={
            progressAvailable
              ? isProcessing
                ? "var(--color-ember-amber)"
                : "var(--color-ember-muted)"
              : "var(--color-ember-dim)"
          }
        />
      </DockItem>

      <DockItem
        label="REPORT"
        active={windows.report}
        disabled={!hasResult}
        tooltip={hasResult ? "View last report" : "No report yet"}
        onClick={onReportClick}
      >
        <ReportIcon
          color={
            hasResult
              ? windows.report
                ? "var(--color-ember-amber)"
                : "var(--color-ember-muted)"
              : "var(--color-ember-dim)"
          }
        />
      </DockItem>
    </div>
  );
}

/* ── Dock item ── */

interface DockItemProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  pulsing?: boolean;
  tooltip?: string;
  onClick: () => void;
  children: React.ReactNode;
}

function DockItem({
  label,
  active,
  disabled,
  pulsing,
  tooltip,
  onClick,
  children,
}: DockItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={tooltip}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        padding: "6px 10px 10px",
        background:
          active
            ? "rgba(244,174,46,0.08)"
            : hovered
            ? "rgba(244,174,46,0.05)"
            : "transparent",
        border: "1px solid",
        borderColor:
          active
            ? "rgba(244,174,46,0.22)"
            : hovered
            ? "rgba(244,174,46,0.10)"
            : "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.28 : 1,
        borderRadius: 12,
        transition: "background 0.2s, border-color 0.2s, opacity 0.2s, transform 0.15s",
        transform: hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
        minWidth: 60,
        position: "relative",
        animation: pulsing ? "dock-item-pulse 1.8s ease-in-out infinite" : undefined,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {children}
      </div>

      <span
        style={{
          fontSize: 8,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: active
            ? "var(--color-ember-amber)"
            : hovered
            ? "var(--color-ember-muted)"
            : "var(--color-ember-dim)",
          fontWeight: 700,
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      {active && (
        <div
          style={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "var(--color-ember-amber)",
            boxShadow: "0 0 5px rgba(244,174,46,0.9)",
          }}
        />
      )}
    </button>
  );
}

/* ── Icons ── */

function TerminalIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <polyline points="6,9 9,12 6,15" />
      <line x1="12" y1="15" x2="16" y2="15" />
    </svg>
  );
}

function ReportIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
