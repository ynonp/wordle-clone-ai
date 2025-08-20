"use client";
import React from "react";

type HeaderProps = {
  onNewGame: () => void;
};

export function Header({ onNewGame }: HeaderProps) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-wide">Wordle Clone</h1>
      <div className="flex items-center gap-2">
        <button
          className="rounded bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          onClick={onNewGame}
        >
          New Game
        </button>
        <a
          href="https://www.nytimes.com/games/wordle/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-gray-500 px-3 py-1 text-sm text-gray-200 hover:bg-gray-700"
        >
          About Wordle
        </a>
      </div>
    </header>
  );
}

