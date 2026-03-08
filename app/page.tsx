"use client";

import { useEffect, useRef, useState } from "react";
import { storage } from "@/app/lib/storage";
import { runAgent } from "@/app/lib/agent";

import { ApiKeyModal } from "@/app/components/ApiKeyModal";
import { DisclaimerModal } from "@/app/components/DisclaimerModal";
import { MainApp } from "@/app/components/MainApp";
import { ProgressView } from "@/app/components/ProgressView";
import { OutputView } from "@/app/components/OutputView";
import { SettingsFab } from "@/app/components/SettingsFab";
import { Toaster } from "@/app/components/Toaster";
import { FireworksOverlay } from "@/app/components/FireworksOverlay";
import { PixelParadeBackground } from "@/app/components/PixelParadeBackground";
import { Dock } from "@/app/components/Dock";
import { useSettings } from "@/app/lib/settings-store";
import type { AnalysisMode, AgentResult, AgentProgress, SkillProfile } from "@/app/lib/types";

const LAST_RESULT_KEY = "CALCIFER_LAST_RESULT";

type Phase = "loading" | "idle" | "processing";

interface AppState {
  phase: Phase;
  needsSetup: boolean;
  progress?: AgentProgress;
  result?: AgentResult;
  progressError?: string;
}

interface Windows {
  mission: boolean;
  progress: boolean;
  report: boolean;
}

export default function Home() {
  const { setHasGeminiKey, isMusicOn } = useSettings();
  const [state, setState] = useState<AppState>({ phase: "loading", needsSetup: false });
  const [windows, setWindows] = useState<Windows>({ mission: false, progress: false, report: false });
  const [showFireworks, setShowFireworks] = useState(false);
  const [showMusicNudge, setShowMusicNudge] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const initialised = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Init audio element once
  useEffect(() => {
    audioRef.current = new Audio("/activesong.mp3");
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Play / pause based on phase + user music toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.phase === "processing" && isMusicOn) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state.phase, isMusicOn]);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const hasKey = storage.hasApiKey();

    if (!localStorage.getItem("CALCIFER_DISCLAIMER_AGREED")) {
      setShowDisclaimer(true);
    }

    try {
      const saved = localStorage.getItem(LAST_RESULT_KEY);
      if (saved) {
        const result = JSON.parse(saved) as AgentResult;
        setState({ phase: "idle", needsSetup: !hasKey, result });
        return;
      }
    } catch {
      // ignore bad JSON
    }

    setState({ phase: "idle", needsSetup: !hasKey });
  }, []);

  useEffect(() => {
    if (state.result) {
      try {
        localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(state.result));
      } catch {
        // ignore
      }
    }
  }, [state.result]);

  function handleCalciferClick() {
    setWindows((prev) => ({ ...prev, mission: !prev.mission }));
  }

  function handleKeySet() {
    setState((prev) => ({ ...prev, needsSetup: false }));
    setHasGeminiKey(true);
  }

  function handleIgnite(url: string, mode: AnalysisMode, focus: string, skillProfile?: SkillProfile) {
    setState((prev) => ({ ...prev, phase: "processing", progress: undefined, progressError: undefined }));
    setWindows({ mission: false, progress: true, report: false });

    // Show music nudge for 5s (only if music is off)
    if (!isMusicOn) {
      setShowMusicNudge(true);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = setTimeout(() => setShowMusicNudge(false), 5000);
    }

    runAgent({
      url,
      mode,
      focus,
      skillProfile,
      onProgress: (progress) => {
        setState((prev) => ({ ...prev, progress }));
      },
    })
      .then((result) => {
        setState((prev) => ({ ...prev, phase: "idle", result }));
        setWindows({ mission: false, progress: false, report: true });
        setShowFireworks(true);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Something went wrong. The fire went out.";
        setState((prev) => ({ ...prev, phase: "idle", progressError: message }));
        setWindows((prev) => ({ ...prev, progress: true }));
      });
  }

  function handleNewMission() {
    setWindows((prev) => ({ ...prev, report: false, mission: true }));
  }

  if (state.phase === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="animate-flicker"
          style={{
            color: "var(--color-ember-amber)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.55,
          }}
        >
          Warming up...
        </span>
      </div>
    );
  }

  const hasResult = !!state.result;
  const progressAvailable = state.phase === "processing" || !!state.progress;

  return (
    <>
      {showDisclaimer && (
        <DisclaimerModal
          onAgree={() => {
            localStorage.setItem("CALCIFER_DISCLAIMER_AGREED", "1");
            setShowDisclaimer(false);
          }}
        />
      )}
      <Toaster />
      <SettingsFab showMusicNudge={showMusicNudge} />

      {/* Watermark — always visible, animates only while agent is working */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(3rem, 10vw, 7rem)",
            fontWeight: 700,
            letterSpacing: "0.35em",
            lineHeight: 1,
            display: "inline-flex",
          }}
        >
          {"CALCIFER".split("").map((char, i) =>
            state.phase === "processing" ? (
              <span
                key={i}
                style={{
                  animation: `char-ignite 4s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  animationFillMode: "both",
                  display: "inline-block",
                }}
              >
                {char}
              </span>
            ) : (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: 0.035,
                  color: "var(--color-ember-amber)",
                }}
              >
                {char}
              </span>
            )
          )}
        </span>
      </div>

      <PixelParadeBackground processing={state.phase === "processing"} />
      {showFireworks && <FireworksOverlay active />}

      {windows.mission && (
        state.needsSetup ? (
          <ApiKeyModal
            onKeySet={handleKeySet}
            onMinimize={() => setWindows((prev) => ({ ...prev, mission: false }))}
          />
        ) : (
          <MainApp
            onIgnite={handleIgnite}
            onClose={() => setWindows((prev) => ({ ...prev, mission: false }))}
            onMinimize={() => setWindows((prev) => ({ ...prev, mission: false }))}
          />
        )
      )}

      {windows.progress && (
        <ProgressView
          live={state.progress}
          error={state.progressError}
          onClose={() => setWindows((prev) => ({ ...prev, progress: false }))}
          onMinimize={() => setWindows((prev) => ({ ...prev, progress: false }))}
        />
      )}

      {hasResult && windows.report && state.result && (
        <OutputView
          result={state.result}
          onReset={handleNewMission}
          onClose={() => { setWindows((prev) => ({ ...prev, report: false })); setShowFireworks(false); }}
          onMinimize={() => { setWindows((prev) => ({ ...prev, report: false })); setShowFireworks(false); }}
        />
      )}

      <Dock
        phase={state.phase}
        hasResult={hasResult}
        progressAvailable={progressAvailable}
        windows={windows}
        onCalciferClick={handleCalciferClick}
        onProgressClick={() =>
          progressAvailable && setWindows((prev) => ({ ...prev, progress: !prev.progress }))
        }
        onReportClick={() => {
          if (hasResult) {
            setShowFireworks(false);
            setWindows((prev) => ({ ...prev, report: !prev.report }));
          }
        }}
      />
    </>
  );
}
