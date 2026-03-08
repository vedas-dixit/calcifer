"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "./storage";

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

interface SettingsState {
  hasGeminiKey: boolean;
  hasSkillProfile: boolean;
  isMusicOn: boolean;
  setHasGeminiKey: (v: boolean) => void;
  setHasSkillProfile: (v: boolean) => void;
  setIsMusicOn: (v: boolean) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SettingsContext = createContext<SettingsState>({
  hasGeminiKey: false,
  hasSkillProfile: false,
  isMusicOn: false,
  setHasGeminiKey: () => {},
  setHasSkillProfile: () => {},
  setIsMusicOn: () => {},
});

// ---------------------------------------------------------------------------
// Provider — mount once at root, reads localStorage on client
// ---------------------------------------------------------------------------

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasSkillProfile, setHasSkillProfile] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);

  useEffect(() => {
    setHasGeminiKey(storage.hasApiKey());
    setHasSkillProfile(storage.hasSkillProfile());
  }, []);

  return (
    <SettingsContext.Provider
      value={{ hasGeminiKey, hasSkillProfile, isMusicOn, setHasGeminiKey, setHasSkillProfile, setIsMusicOn }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSettings() {
  return useContext(SettingsContext);
}
