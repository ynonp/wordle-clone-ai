"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { Keyboard } from "@/components/Keyboard";
import { Modal } from "@/components/Modal";
import {
  EvaluatedCell,
  GameState,
  GameStatus,
  MAX_GUESSES,
  WORD_LENGTH,
  evaluateGuess,
  normalizeGuess,
  pickDailySolution,
  randomSolution,
  isValidWord,
  deriveKeyboard,
  loadState,
  saveState,
} from "@/lib/wordle";

export default function Home() {
  const [solution, setSolution] = useState<string>(pickDailySolution);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<EvaluatedCell[][]>([]);
  const [current, setCurrent] = useState<string>("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState<string>("");
  const [showWin, setShowWin] = useState(false);
  
  // Animation state
  const [animatingRow, setAnimatingRow] = useState<number | undefined>();
  const [animatingTiles, setAnimatingTiles] = useState<boolean[]>([]);

  // Load existing game from localStorage
  useEffect(() => {
    const state = loadState();
    if (state && state.solution) {
      setSolution(state.solution);
      setGuesses(state.guesses);
      const evals = state.guesses.map((g) => evaluateGuess(g, state.solution));
      setResults(evals);
      const newStatus: GameStatus = state.status ?? (state.guesses.includes(state.solution) ? "won" : state.guesses.length >= MAX_GUESSES ? "lost" : "playing");
      setStatus(newStatus);
    }
  }, []);

  // Persist state
  useEffect(() => {
    const s: GameState = {
      solution,
      guesses,
      status,
      lastPlayed: new Date().toISOString(),
    };
    saveState(s);
  }, [solution, guesses, status]);

  // Timed ephemeral messages
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 1600);
    return () => clearTimeout(t);
  }, [message]);

  const keyStatuses = useMemo(() => deriveKeyboard(results), [results]);

  const handleSubmit = useCallback(() => {
    if (status !== "playing" || animatingRow !== undefined) return; // Prevent new submissions during animation
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
    const newGuesses = [...guesses, guess];
    const rowIndex = results.length;
    
    // Start animation
    setAnimatingRow(rowIndex);
    setAnimatingTiles(new Array(WORD_LENGTH).fill(false));
    setCurrent("");
    
    // Add the result immediately (but tiles will show animation)
    const newResults = [...results, evaluation];
    setResults(newResults);
    setGuesses(newGuesses);
    
    // Animate tiles one by one with delays
    for (let i = 0; i < WORD_LENGTH; i++) {
      setTimeout(() => {
        setAnimatingTiles(prev => {
          const updated = [...prev];
          updated[i] = true;
          return updated;
        });
      }, i * 100);
    }
    
    // End animation after all tiles are done
    setTimeout(() => {
      setAnimatingRow(undefined);
      setAnimatingTiles([]);
      
      // Check game end conditions after animation completes
      if (guess === solution) {
        setStatus("won");
        setShowWin(true);
        setMessage("You win!");
      } else if (newGuesses.length >= MAX_GUESSES) {
        setStatus("lost");
        setShowWin(true);
        setMessage(solution);
      }
    }, WORD_LENGTH * 100 + 600); // 600ms for the animation duration
  }, [current, status, solution, results, guesses, animatingRow]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== "playing" || animatingRow !== undefined) return; // Prevent input during animation
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
    [handleSubmit, status, animatingRow]
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
    setAnimatingRow(undefined);
    setAnimatingTiles([]);
  }, []);

  return (
    <main className="mx-auto max-w-md p-4">
      <Header onNewGame={newGame} />
      <div className="flex flex-col items-center gap-4">
        <Board 
          results={results} 
          currentGuess={current} 
          animatingRow={animatingRow}
          animatingTiles={animatingTiles}
        />
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
  );
}
