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

export function randomSolution(): string {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
}

export function getSolutionForDayIndex(dayIndex: number): string {
  const idx = dayIndex % ANSWERS.length;
  return ANSWERS[idx];
}

export function getDayIndexFromDate(date: Date, base = new Date("2022-01-01T00:00:00Z")): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const idx = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - base.getTime()) / msPerDay);
  return Math.max(0, idx);
}

export function getDateFromDayIndex(dayIndex: number, base = new Date("2022-01-01T00:00:00Z")): Date {
  const msPerDay = 24 * 60 * 60 * 1000;
  const targetTime = base.getTime() + (dayIndex * msPerDay);
  return new Date(targetTime);
}

export function getHistoryDays(maxDays: number = 30): Array<{dayIndex: number, date: Date, solution: string}> {
  const currentDayIndex = getDayIndex();
  const history: Array<{dayIndex: number, date: Date, solution: string}> = [];
  
  for (let i = 0; i < maxDays && currentDayIndex - i >= 0; i++) {
    const dayIndex = currentDayIndex - i;
    const date = getDateFromDayIndex(dayIndex);
    const solution = getSolutionForDayIndex(dayIndex);
    history.push({ dayIndex, date, solution });
  }
  
  return history;
}

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  solution: string;
  guesses: string[];
  status: GameStatus;
  hardMode?: boolean;
  lastPlayed: string; // ISO date
  dayIndex?: number; // Add day index to track which day this game is for
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

export function loadStateForDay(dayIndex: number): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const historyRaw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history = historyRaw ? JSON.parse(historyRaw) : {};
    return history[dayIndex] || null;
  } catch {
    return null;
  }
}

export function saveState(state: GameState) {
  if (typeof window === "undefined") return;
  try {
    // Save current state for compatibility
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Also save to history if dayIndex is provided
    if (state.dayIndex !== undefined) {
      const historyRaw = localStorage.getItem(HISTORY_STORAGE_KEY);
      const history = historyRaw ? JSON.parse(historyRaw) : {};
      history[state.dayIndex] = state;
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  } catch {
    // ignore quota errors
  }
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

