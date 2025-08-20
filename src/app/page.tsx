"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  pickDailySolution,
  getSolutionForDayIndex,
  randomSolution,
  isValidWord,
  deriveKeyboard,
  loadState,
  loadStateForDay,
  saveState,
  getDayIndex,
} from "@/lib/wordle";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get selected day from URL parameter
  const urlDay = searchParams.get("day");
  const selectedDayIndex = urlDay ? parseInt(urlDay, 10) : null;
  const currentDayIndex = getDayIndex();
  
  // Determine which day we're playing (URL parameter or current day)
  const activeDayIndex = selectedDayIndex ?? currentDayIndex;
  const isPlayingHistorical = selectedDayIndex !== null;
  
  const [solution, setSolution] = useState<string>(() => 
    isPlayingHistorical ? getSolutionForDayIndex(activeDayIndex) : pickDailySolution()
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<EvaluatedCell[][]>([]);
  const [current, setCurrent] = useState<string>("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState<string>("");
  const [showWin, setShowWin] = useState(false);

  // Load existing game from localStorage
  useEffect(() => {
    const state = isPlayingHistorical 
      ? loadStateForDay(activeDayIndex)
      : loadState();
      
    if (state && state.solution) {
      setSolution(state.solution);
      setGuesses(state.guesses);
      const evals = state.guesses.map((g) => evaluateGuess(g, state.solution));
      setResults(evals);
      const newStatus: GameStatus = state.status ?? (state.guesses.includes(state.solution) ? "won" : state.guesses.length >= MAX_GUESSES ? "lost" : "playing");
      setStatus(newStatus);
    } else {
      // Reset state for the new day
      const newSolution = isPlayingHistorical ? getSolutionForDayIndex(activeDayIndex) : pickDailySolution();
      setSolution(newSolution);
      setGuesses([]);
      setResults([]);
      setStatus("playing");
      setCurrent("");
      setShowWin(false);
    }
  }, [activeDayIndex, isPlayingHistorical]);

  // Persist state
  useEffect(() => {
    const s: GameState = {
      solution,
      guesses,
      status,
      lastPlayed: new Date().toISOString(),
      dayIndex: activeDayIndex,
    };
    saveState(s);
  }, [solution, guesses, status, activeDayIndex]);

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
    setSolution(randomSolution());
    setGuesses([]);
    setResults([]);
    setCurrent("");
    setStatus("playing");
    setShowWin(false);
    setMessage("New game");
  }, []);

  const handleDaySelect = useCallback((dayIndex: number | null) => {
    if (dayIndex === null) {
      // Go back to current day
      router.push("/");
    } else {
      // Navigate to historical day
      router.push(`/?day=${dayIndex}`);
    }
  }, [router]);

  return (
    <>
      <HistorySidebar 
        selectedDayIndex={selectedDayIndex}
        onDaySelect={handleDaySelect}
      />
      <main className="mx-auto max-w-md p-4">
        <Header onNewGame={newGame} />
        {isPlayingHistorical && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-md">
            <p className="text-sm text-blue-200">
              📅 Playing historical game from{" "}
              {new Date(new Date("2022-01-01T00:00:00Z").getTime() + activeDayIndex * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        )}
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
