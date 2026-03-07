const GEMINI_KEY = "EMBERCORE_GEMINI_KEY";
const GITHUB_KEY = "EMBERCORE_GITHUB_KEY";

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
};
