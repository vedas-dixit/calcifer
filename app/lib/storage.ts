const GEMINI_KEY = "CALCIFER_GEMINI_KEY";
const GITHUB_KEY = "CALCIFER_GITHUB_KEY";
const MODEL_KEY = "CALCIFER_MODEL";

export const DEFAULT_MODEL = "gemini-2.5-pro";

export const storage = {
  getApiKey(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(GEMINI_KEY);
  },

  setApiKey(key: string): void {
    localStorage.setItem(GEMINI_KEY, key);
  },

  clearApiKey(): void {
    localStorage.removeItem(GEMINI_KEY);
  },

  hasApiKey(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(GEMINI_KEY);
  },

  getGithubKey(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(GITHUB_KEY);
  },

  setGithubKey(key: string): void {
    localStorage.setItem(GITHUB_KEY, key);
  },

  clearGithubKey(): void {
    localStorage.removeItem(GITHUB_KEY);
  },

  getModel(): string {
    if (typeof window === "undefined") return DEFAULT_MODEL;
    return localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL;
  },

  setModel(model: string): void {
    localStorage.setItem(MODEL_KEY, model);
  },
};
