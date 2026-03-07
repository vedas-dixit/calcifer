// ---------------------------------------------------------------------------
// Toast singleton — call toast.fire / toast.error / toast.info from anywhere
// Toaster component subscribes via subscribeToToasts()
// ---------------------------------------------------------------------------

export type ToastType = "fire" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

const listeners = new Set<Listener>();
let items: ToastItem[] = [];

function add(message: string, type: ToastType, duration: number) {
  const id = Math.random().toString(36).slice(2, 9);
  items = [...items, { id, message, type, duration }];
  notify();
  setTimeout(() => dismiss(id), duration);
}

export function dismiss(id: string) {
  items = items.filter((t) => t.id !== id);
  notify();
}

function notify() {
  listeners.forEach((l) => l([...items]));
}

export function subscribeToToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener([...items]); // sync current state on subscribe
  return () => listeners.delete(listener);
}

export const toast = {
  fire(message: string, duration = 4500) {
    add(message, "fire", duration);
  },
  error(message: string, duration = 5500) {
    add(message, "error", duration);
  },
  info(message: string, duration = 4000) {
    add(message, "info", duration);
  },
};
