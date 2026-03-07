"use client";

import { useEffect, useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { storage, DEFAULT_MODEL } from "@/app/lib/storage";

interface GeminiModel {
  name: string;         // "models/gemini-2.5-pro"
  displayName: string;  // "Gemini 2.5 Pro"
  description?: string;
  supportedGenerationMethods: string[];
}

interface Props {
  apiKey: string;
  onClose: () => void;
}

export function ModelPickerWindow({ apiKey, onClose }: Props) {
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selected, setSelected] = useState<string>(storage.getModel());

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json() as { models: GeminiModel[] };
        // Keep only models that can generate content
        const filtered = (data.models ?? []).filter((m) =>
          m.supportedGenerationMethods?.includes("generateContent")
        );
        setModels(filtered);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }
    loadModels();
  }, [apiKey]);

  function handleSelect(modelName: string) {
    // API returns "models/gemini-2.5-pro" — strip the prefix for storage
    const id = modelName.replace(/^models\//, "");
    setSelected(id);
    storage.setModel(id);
  }

  return (
    <DraggableWindow
      title="MODEL_SELECT.EXE"
      variant="dark"
      defaultWidth={420}
      onClose={onClose}
      zIndex={50}
      titleAlign="right"
    >
      <div style={{ padding: "16px 20px 18px" }}>
        <p className="field-label" style={{ marginBottom: 12 }}>
          Gemini Model
        </p>

        {status === "loading" && (
          <p
            style={{
              color: "var(--color-ember-muted)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            Fetching available models...
          </p>
        )}

        {status === "error" && (
          <p
            style={{
              color: "var(--color-ember-coral)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              lineHeight: 1.6,
            }}
          >
            Could not load models. Check your Gemini API key is valid.
          </p>
        )}

        {status === "ready" && (
          <div
            style={{
              maxHeight: 320,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {models.map((m) => {
              const id = m.name.replace(/^models\//, "");
              const isActive = selected === id || (!selected && id === DEFAULT_MODEL);
              return (
                <ModelRow
                  key={m.name}
                  displayName={m.displayName}
                  id={id}
                  active={isActive}
                  onClick={() => handleSelect(m.name)}
                />
              );
            })}
          </div>
        )}

        <p
          style={{
            color: "var(--color-ember-dim)",
            fontSize: 11,
            marginTop: 14,
            lineHeight: 1.6,
            fontFamily: "var(--font-mono)",
          }}
        >
          Active:{" "}
          <span style={{ color: "var(--color-ember-amber)" }}>
            {selected || DEFAULT_MODEL}
          </span>
        </p>
      </div>
    </DraggableWindow>
  );
}

function ModelRow({
  displayName,
  id,
  active,
  onClick,
}: {
  displayName: string;
  id: string;
  active: boolean;
  onClick: () => void;
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
        padding: "9px 12px",
        borderRadius: 4,
        border: active
          ? "1px solid var(--color-ember-amber)"
          : hovered
            ? "1px solid var(--color-ember-ash)"
            : "1px solid transparent",
        background: active
          ? "rgba(255, 160, 50, 0.07)"
          : hovered
            ? "var(--color-ember-elevated)"
            : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Active indicator dot */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          flexShrink: 0,
          background: active ? "var(--color-ember-amber)" : "var(--color-ember-ash)",
          transition: "background 0.15s",
        }}
      />
      <span style={{ flex: 1 }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: active ? "var(--color-ember-amber)" : "var(--color-ember-text)",
            letterSpacing: "0.02em",
          }}
        >
          {displayName}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-ember-dim)",
            marginTop: 1,
            letterSpacing: "0.03em",
          }}
        >
          {id}
        </span>
      </span>
      {active && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-ember-amber)",
            letterSpacing: "0.08em",
          }}
        >
          ACTIVE
        </span>
      )}
    </button>
  );
}
