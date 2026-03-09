"use client";

import { DraggableWindow } from "./DraggableWindow";
import { FireAnimation } from "./FireAnimation";

interface DisclaimerModalProps {
  onAgree: () => void;
}

export function DisclaimerModal({ onAgree }: DisclaimerModalProps) {
  function handleDisagree() {
    window.location.href =
      "https://i.pinimg.com/736x/77/03/3d/77033d8eea07dcbce8f72927f7d0ab31.jpg";
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <DraggableWindow
          title="BEFORE_YOU_PROCEED.txt"
          variant="fire"
          defaultWidth={460}
          // No onClose / onMinimize — traffic lights intentionally disabled
        >
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
              <FireAnimation width={76} height={76} className="animate-flicker" showEyes />
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
                Hey — glad you&apos;re here.
              </h2>
              <p
                style={{
                  color: "var(--color-ember-muted)",
                  fontSize: "13px",
                  lineHeight: "1.65",
                  maxWidth: "340px",
                  margin: "0 auto",
                }}
              >
                A few quick things before the fire lights up.
              </p>
            </div>

            {/* Content rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginBottom: "22px",
                color: "var(--color-ember-muted)",
                fontSize: "13px",
                lineHeight: "1.7",
              }}
            >
              <p>
                <span style={{ color: "var(--color-ember-amber)", fontWeight: 600 }}>
                  Calcifer
                </span>{" "}
                is an open-source side project built purely for learning — by{" "}
                <a
                  href="https://github.com/vedas-dixit"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--color-ember-amber)",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  Vedas Dixit
                </a>
                , a software engineer.
              </p>

              <p>
                <span style={{ color: "var(--color-ember-orange)", fontWeight: 600 }}>
                  🔑 Your API keys
                </span>{" "}
                — Gemini and GitHub — live{" "}
                <span style={{ color: "var(--color-ember-amber)" }}>
                  only in your browser&apos;s localStorage
                </span>
                . No backend, no server, no one else ever sees them. If you&apos;re
                still not sure, just open this in a{" "}
                <span style={{ color: "var(--color-ember-amber)" }}>
                  private / incognito tab
                </span>{" "}
                — keys won&apos;t persist after you close it.
              </p>

              <p>
                <span style={{ color: "var(--color-ember-orange)", fontWeight: 600 }}>
                  🔓 Open source
                </span>{" "}
                — every line of code is on{" "}
                <a
                  href="https://github.com/vedas-dixit"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--color-ember-amber)",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  GitHub
                </a>
                . Read it, fork it, break it.
              </p>

              <p
                style={{
                  color: "var(--color-ember-dim)",
                  fontSize: "12px",
                }}
              >
                Not a commercial product. No analytics. No tracking. Just a fire demon
                that reads repos. Guys at Studio Ghibli: don&apos;t sue me
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-ghost"
                onClick={handleDisagree}
                style={{ flex: 1 }}
              >
                Disagree
              </button>
              <button
                className="btn-ignite"
                onClick={onAgree}
                style={{ flex: 2 }}
              >
                Agree &amp; Enter →
              </button>
            </div>

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
              This notice only appears once.
            </p>
          </div>
        </DraggableWindow>
      </div>
    </div>
  );
}
