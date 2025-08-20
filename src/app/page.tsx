"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { Keyboard } from "@/components/Keyboard";
import { Modal } from "@/components/Modal";
import { HistorySidebar } from "@/components/HistorySidebar";
import {
  EvaluatedCell,
  GameState,
  GameStatus,
  MAX_GUESSES,
  WORD_LENGTH,
  evaluateGuess,
  normalizeGuess,
  randomSolution,
  isValidWord,
  deriveKeyboard,
  loadState,
  saveState,
  loadHistoricalState,
  saveHistoricalState,
  getCurrentDayIndex,
  getSolutionForDay,
  getHistoricalDays,
  getUrlParams,
  setUrlParam,
} from "@/lib/wordle";

export default function Home() {
  const [solution, setSolution] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<EvaluatedCell[][]>([]);
  const [current, setCurrent] = useState<string>("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState<string>("");
  const [showWin, setShowWin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | undefined>(undefined);

  const currentDayIndex = getCurrentDayIndex();
  const activeDayIndex = selectedDayIndex ?? currentDayIndex;
  const isHistoricalGame = selectedDayIndex !== undefined && selectedDayIndex !== currentDayIndex;

  // Initialize game based on URL parameters
  const initializeGame = useCallback(() => {
    const urlParams = getUrlParams();
    const dayIndex = urlParams.day ?? currentDayIndex;
    
    setSelectedDayIndex(urlParams.day);
    
    // Load state for the selected day
    let state: GameState | null = null;
    if (dayIndex === currentDayIndex) {
      state = loadState();
    } else {
      state = loadHistoricalState(dayIndex);
    }

    // Get solution for the day
    const solution = getSolutionForDay(dayIndex);
    setSolution(solution);

    if (state && state.solution === solution) {
      setGuesses(state.guesses);
      const evals = state.guesses.map((g) => evaluateGuess(g, state.solution));
      setResults(evals);
      const newStatus: GameStatus = state.status ?? (state.guesses.includes(state.solution) ? "won" : state.guesses.length >= MAX_GUESSES ? "lost" : "playing");
      setStatus(newStatus);
    } else {
      // Reset game state for this day
      setGuesses([]);
      setResults([]);
      setStatus("playing");
    }
    
    setCurrent("");
    setShowWin(false);
  }, [currentDayIndex]);

  // Load game on mount and when URL changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Persist state
  const persistState = useCallback(() => {
    const s: GameState = {
      solution,
      guesses,
      status,
      lastPlayed: new Date().toISOString(),
      dayIndex: activeDayIndex,
    };
    
    if (isHistoricalGame) {
      saveHistoricalState(activeDayIndex, s);
    } else {
      saveState(s);
    }
  }, [solution, guesses, status, activeDayIndex, isHistoricalGame]);

  // Save state when game changes
  useEffect(() => {
    if (solution) {
      persistState();
    }
  }, [solution, guesses, status, persistState]);

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

    const newStatus: GameStatus = guess === solution ? "won" : 
      newGuesses.length >= MAX_GUESSES ? "lost" : "playing";
    setStatus(newStatus);

    if (newStatus !== "playing") {
      setShowWin(true);
      setMessage(newStatus === "won" ? "You win!" : solution);
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
    const newSolution = randomSolution();
    setSolution(newSolution);
    setGuesses([]);
    setResults([]);
    setCurrent("");
    setStatus("playing");
    setShowWin(false);
    setMessage("New game");
    
    // Clear URL parameters for random games
    setSelectedDayIndex(undefined);
    setUrlParam();
  }, []);

  const onSelectDay = useCallback((dayIndex: number) => {
    setSelectedDayIndex(dayIndex === currentDayIndex ? undefined : dayIndex);
    setUrlParam(dayIndex === currentDayIndex ? undefined : dayIndex);
    setSidebarOpen(false);
    
    // Load the game for the selected day
    const solution = getSolutionForDay(dayIndex);
    setSolution(solution);
    
    let state: GameState | null = null;
    if (dayIndex === currentDayIndex) {
      state = loadState();
    } else {
      state = loadHistoricalState(dayIndex);
    }

    if (state && state.solution === solution) {
      setGuesses(state.guesses);
      const evals = state.guesses.map((g) => evaluateGuess(g, state.solution));
      setResults(evals);
      const newStatus: GameStatus = state.status ?? (state.guesses.includes(state.solution) ? "won" : state.guesses.length >= MAX_GUESSES ? "lost" : "playing");
      setStatus(newStatus);
    } else {
      setGuesses([]);
      setResults([]);
      setStatus("playing");
    }
    
    setCurrent("");
    setShowWin(false);
    setMessage(dayIndex === currentDayIndex ? "Today's game" : `Playing ${new Date(new Date("2022-01-01").getTime() + dayIndex * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
  }, [currentDayIndex]);

  // Prepare history data
  const historyDays = useMemo(() => {
    const days = getHistoricalDays(currentDayIndex, 30);
    return days.map(day => {
      const state = loadHistoricalState(day.dayIndex);
      return {
        ...day,
        played: state ? state.guesses.length > 0 : false,
        won: state ? state.status === "won" : false,
      };
    });
  }, [currentDayIndex]);

  return (
    <>
      <HistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        historyDays={historyDays}
        currentDayIndex={currentDayIndex}
        onSelectDay={onSelectDay}
        selectedDayIndex={selectedDayIndex}
      />
      
      <main className="mx-auto max-w-md p-4">{/* removed the dynamic margin left */}
        <Header onNewGame={newGame} />
        
        {/* Game info for historical games */}
        {isHistoricalGame && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-600 rounded-lg">
            <div className="text-sm text-blue-200">
              Playing: {new Date(new Date("2022-01-01").getTime() + activeDayIndex * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            <div className="text-xs text-blue-300">
              Historical game
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center gap-4">
          <Board results={results} currentGuess={current} />
          <Keyboard keyStatuses={keyStatuses} onKey={onKey} />
        </div>

        {/* Toast message */}
        {message && (
          <div className="fixed left-1/2 top-16 -translate-x-1/2 rounded bg-gray-900 px-3 py-2 text-sm text-white shadow z-30">
            {message}
          </div>
        )}

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
    </>
  );
}
