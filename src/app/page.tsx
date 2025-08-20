"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { Keyboard } from "@/components/Keyboard";
import { Modal } from "@/components/Modal";
import { Sidebar } from "@/components/Sidebar";
import {
  EvaluatedCell,
  GameState,
  GameStatus,
  GameHistory,
  MAX_GUESSES,
  WORD_LENGTH,
  evaluateGuess,
  normalizeGuess,
  isValidWord,
  deriveKeyboard,
  loadState,
  saveState,
  loadGameHistory,
  getGameForDay,
  saveGameForDay,
  getDayIndex,
  getSolutionForDay,
} from "@/lib/wordle";

export default function Home() {
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(getDayIndex());
  const [solution, setSolution] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<EvaluatedCell[][]>([]);
  const [current, setCurrent] = useState<string>("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState<string>("");
  const [showWin, setShowWin] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistory>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load game history and migrate legacy state if needed
  useEffect(() => {
    const history = loadGameHistory();
    setGameHistory(history);

    // Migrate legacy state if exists and no history
    const legacyState = loadState();
    if (legacyState && Object.keys(history).length === 0) {
      const todayIndex = getDayIndex();
      saveGameForDay(todayIndex, { ...legacyState, dayIndex: todayIndex });
      setGameHistory({ [todayIndex]: { ...legacyState, dayIndex: todayIndex } });
    }
  }, []);

  // Load game for current day
  useEffect(() => {
    const gameForDay = getGameForDay(currentDayIndex);
    const solutionForDay = getSolutionForDay(currentDayIndex);
    
    if (gameForDay) {
      setSolution(gameForDay.solution);
      setGuesses(gameForDay.guesses);
      const evals = gameForDay.guesses.map((g) => evaluateGuess(g, gameForDay.solution));
      setResults(evals);
      setStatus(gameForDay.status);
    } else {
      // New game for this day
      setSolution(solutionForDay);
      setGuesses([]);
      setResults([]);
      setStatus("playing");
    }
    
    setCurrent("");
    setShowWin(false);
    setMessage("");
  }, [currentDayIndex]);

  // Persist state to history
  useEffect(() => {
    if (solution && guesses.length >= 0) {
      const gameState: GameState = {
        solution,
        guesses,
        status,
        lastPlayed: new Date().toISOString(),
        dayIndex: currentDayIndex,
      };
      
      saveGameForDay(currentDayIndex, gameState);
      setGameHistory(prev => ({ ...prev, [currentDayIndex]: gameState }));
      
      // Also save to legacy storage for backward compatibility
      saveState(gameState);
    }
  }, [solution, guesses, status, currentDayIndex]);

  // Timed ephemeral messages
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 1600);
    return () => clearTimeout(t);
  }, [message]);

  const keyStatuses = useMemo(() => deriveKeyboard(results), [results]);

  const handleSubmit = useCallback(() => {
    if (status !== "playing") return;
    if (current.length !== WORD_LENGTH) {
      setMessage("Not enough letters");
      return;
    }
    const guess = current.toUpperCase();
    if (!isValidWord(guess)) {
      setMessage("Not in word list");
      return;
    }
    const evaluation = evaluateGuess(guess, solution);
    const newResults = [...results, evaluation];
    const newGuesses = [...guesses, guess];
    setResults(newResults);
    setGuesses(newGuesses);
    setCurrent("");

    if (guess === solution) {
      setStatus("won");
      setShowWin(true);
      setMessage("You win!");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setStatus("lost");
      setShowWin(true);
      setMessage(solution);
    }
  }, [current, status, solution, results, guesses]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;
      if (key === "ENTER") {
        handleSubmit();
        return;
      }
      if (key === "DEL" || key === "BACKSPACE") {
        setCurrent((s) => s.slice(0, -1));
        return;
      }
      if (/^[a-zA-Z]$/.test(key)) {
        setCurrent((s) => (s.length < WORD_LENGTH ? normalizeGuess(s + key) : s));
      }
    },
    [handleSubmit, status]
  );

  // Global keyboard capture
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const label = e.key.length === 1 ? e.key.toUpperCase() : e.key.toUpperCase();
      if (label === "ENTER" || label === "BACKSPACE" || /^[A-Z]$/.test(label)) {
        e.preventDefault();
        onKey(label === "BACKSPACE" ? "DEL" : label);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKey]);

  const newGame = useCallback(() => {
    const today = getDayIndex();
    setCurrentDayIndex(today);
    // The useEffect will handle loading/creating the game for today
    setMessage("New game");
  }, []);

  const handleSelectDay = useCallback((dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    setSidebarOpen(false);
  }, []);

  const handleToggleHistory = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <main className="mx-auto max-w-md p-4">
      <Header onNewGame={newGame} onToggleHistory={handleToggleHistory} />
      <div className="flex flex-col items-center gap-4">
        <Board results={results} currentGuess={current} />
        <Keyboard keyStatuses={keyStatuses} onKey={onKey} />
      </div>

      {/* Toast message */}
      {message && (
        <div className="fixed left-1/2 top-16 -translate-x-1/2 rounded bg-gray-900 px-3 py-2 text-sm text-white shadow">
          {message}
        </div>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        gameHistory={gameHistory}
        currentDayIndex={currentDayIndex}
        onSelectDay={handleSelectDay}
      />

      <Modal title={status === "won" ? "You Won!" : "Game Over"} open={showWin} onClose={() => setShowWin(false)}>
        {status === "won" ? (
          <p className="mb-2">Great job! Want to play again?</p>
        ) : (
          <p className="mb-2">The word was: <strong>{solution}</strong></p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <button
            className="rounded bg-gray-800 px-3 py-1 text-white hover:bg-gray-700"
            onClick={() => setShowWin(false)}
          >
            Close
          </button>
          <button
            className="rounded bg-green-600 px-3 py-1 font-semibold text-white hover:bg-green-500"
            onClick={() => {
              setShowWin(false);
              newGame();
            }}
          >
            New Game
          </button>
        </div>
      </Modal>
    </main>
  );
}
