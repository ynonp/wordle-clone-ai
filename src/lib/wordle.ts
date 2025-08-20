export type LetterStatus = "correct" | "present" | "absent" | "empty";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

// Keep lists small to reduce bundle size. Extend as needed.
export const ANSWERS: string[] = [
  "CRANE", "SLATE", "ROAST", "BRAVE", "LIGHT", "SOUND", "TRACK", "PLANT",
  "GRAIN", "POINT", "SMILE", "TOUCH", "BRICK", "CLOUD", "FRAME", "HEART",
  "SHARE", "DRIVE", "STONE", "WATER", "ALERT", "FLAME", "PRIDE", "QUIET"
];

export type EvaluatedCell = { letter: string; status: LetterStatus };

export function normalizeGuess(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, WORD_LENGTH);
}

export function isValidWord(guess: string): boolean {
  const g = guess.toUpperCase();
  return g.length === WORD_LENGTH && /^[A-Z]+$/.test(g);
}

// Two-pass evaluation matching Wordle semantics, including duplicate handling.
export function evaluateGuess(guess: string, solution: string): EvaluatedCell[] {
  const g = guess.toUpperCase();
  const s = solution.toUpperCase();
  const result: EvaluatedCell[] = Array.from(g).map((ch) => ({ letter: ch, status: "absent" }));

  // First pass: mark correct and count remaining letters in solution
  const remaining: Record<string, number> = {};
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (g[i] === s[i]) {
      result[i].status = "correct";
    } else {
      remaining[s[i]] = (remaining[s[i]] ?? 0) + 1;
    }
  }

  // Second pass: mark present where applicable
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].status === "correct") continue;
    const ch = g[i];
    if (remaining[ch] > 0) {
      result[i].status = "present";
      remaining[ch]!--;
    } else {
      result[i].status = "absent";
    }
  }

  return result;
}

export function getDayIndex(base = new Date("2022-01-01T00:00:00Z")): number {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const idx = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - base.getTime()) / msPerDay);
  return Math.max(0, idx);
}

export function pickDailySolution(): string {
  const idx = getDayIndex() % ANSWERS.length;
  return ANSWERS[idx];
}

export function getSolutionForDay(dayIndex: number): string {
  const idx = dayIndex % ANSWERS.length;
  return ANSWERS[idx];
}

export function getCurrentDayIndex(): number {
  return getDayIndex();
}

export function randomSolution(): string {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
}

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  solution: string;
  guesses: string[];
  status: GameStatus;
  hardMode?: boolean;
  lastPlayed: string; // ISO date
  dayIndex?: number; // For historical games
};

const STORAGE_KEY = "wordle-state-v1";
const HISTORY_STORAGE_KEY = "wordle-history-v1";

export function loadState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as GameState : null;
  } catch {
    return null;
  }
}

export function saveState(state: GameState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function loadHistoricalState(dayIndex: number): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : {};
    return history[dayIndex] || null;
  } catch {
    return null;
  }
}

export function saveHistoricalState(dayIndex: number, state: GameState) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : {};
    history[dayIndex] = { ...state, dayIndex };
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore quota errors
  }
}

export function getHistoricalDays(currentDayIndex: number, daysBack: number = 30): Array<{dayIndex: number, solution: string, date: Date}> {
  const days = [];
  for (let i = 1; i <= daysBack; i++) {
    const dayIndex = currentDayIndex - i;
    if (dayIndex < 0) break;
    
    const solution = getSolutionForDay(dayIndex);
    const baseDate = new Date("2022-01-01T00:00:00Z");
    const date = new Date(baseDate.getTime() + dayIndex * 24 * 60 * 60 * 1000);
    
    days.push({ dayIndex, solution, date });
  }
  return days;
}

export function getUrlParams(): { day?: number } {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const day = params.get('day');
  return {
    day: day ? parseInt(day, 10) : undefined
  };
}

export function setUrlParam(day?: number) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (day !== undefined && day !== getCurrentDayIndex()) {
    url.searchParams.set('day', day.toString());
  } else {
    url.searchParams.delete('day');
  }
  window.history.replaceState({}, '', url.toString());
}

export function deriveKeyboard(resultRows: EvaluatedCell[][]): Record<string, LetterStatus> {
  const priority: Record<LetterStatus, number> = { empty: 0, absent: 1, present: 2, correct: 3 };
  const map: Record<string, LetterStatus> = {};
  for (const row of resultRows) {
    for (const cell of row) {
      const key = cell.letter.toUpperCase();
      const prev = map[key] ?? "empty";
      if (priority[cell.status] > priority[prev]) {
        map[key] = cell.status;
      }
    }
  }
  return map;
}

