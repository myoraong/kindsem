import type { HistoryEntry } from "@/lib/calculator-engine";

const HISTORY_KEY = "deskcalc-history";
const MEMORY_KEY = "deskcalc-memory";

export function loadPersisted(): {
  history: HistoryEntry[];
  memory: number;
} {
  if (typeof window === "undefined") {
    return { history: [], memory: 0 };
  }

  try {
    const rawHistory = window.localStorage.getItem(HISTORY_KEY);
    const rawMemory = window.localStorage.getItem(MEMORY_KEY);
    const history = rawHistory ? (JSON.parse(rawHistory) as HistoryEntry[]) : [];
    const memory = rawMemory ? Number(rawMemory) : 0;
    return {
      history: Array.isArray(history) ? history : [],
      memory: Number.isFinite(memory) ? memory : 0,
    };
  } catch {
    return { history: [], memory: 0 };
  }
}

export function savePersisted(history: HistoryEntry[], memory: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.localStorage.setItem(MEMORY_KEY, String(memory));
}
