"use client";
import React from "react";
import { EvaluatedCell, LetterStatus, WORD_LENGTH, MAX_GUESSES } from "@/lib/wordle";
import { cn } from "@/lib/utils";

type BoardProps = {
  results: EvaluatedCell[][]; // completed guesses
  currentGuess: string; // partial input
  animatingRow?: number; // row index that is currently animating
  animatingTiles?: boolean[]; // which tiles in the animating row are currently animating
};

const statusClass: Record<LetterStatus, string> = {
  correct: "bg-green-600 text-white border-green-600",
  present: "bg-yellow-500 text-white border-yellow-500",
  absent: "bg-gray-700 text-white border-gray-700",
  empty: "bg-transparent text-white border-gray-600",
};

function Tile({ 
  letter, 
  status, 
  isAnimating = false,
  animationDelay = 0
}: { 
  letter: string; 
  status: LetterStatus;
  isAnimating?: boolean;
  animationDelay?: number;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded border text-2xl font-semibold uppercase select-none",
        statusClass[status],
        isAnimating && "tile-flip"
      )}
      style={isAnimating ? { animationDelay: `${animationDelay}ms` } : {}}
      aria-label={status !== "empty" ? `${letter} ${status}` : letter}
    >
      {letter}
    </div>
  );
}

export const Board = React.memo(function Board({ 
  results, 
  currentGuess, 
  animatingRow,
  animatingTiles 
}: BoardProps) {
  const rows: Array<React.ReactNode> = [];
  const filledRows = results.length;

  // Completed rows
  for (let r = 0; r < filledRows; r++) {
    const row = results[r];
    const isAnimatingThisRow = animatingRow === r;
    rows.push(
      <div key={`row-${r}`} className="grid grid-cols-5 gap-2">
        {row.map((cell, i) => (
          <Tile 
            key={i} 
            letter={cell.letter} 
            status={cell.status}
            isAnimating={isAnimatingThisRow && animatingTiles?.[i]}
            animationDelay={isAnimatingThisRow ? i * 100 : 0}
          />
        ))}
      </div>
    );
  }

  // Current row
  if (filledRows < MAX_GUESSES) {
    const letters = currentGuess.padEnd(WORD_LENGTH).split("");
    rows.push(
      <div key={`row-current`} className="grid grid-cols-5 gap-2">
        {letters.map((ch, i) => (
          <Tile key={i} letter={ch.trim()} status={ch.trim() ? "empty" : "empty"} />
        ))}
      </div>
    );
  }

  // Empty rows
  for (let r = filledRows + 1; r < MAX_GUESSES; r++) {
    rows.push(
      <div key={`row-empty-${r}`} className="grid grid-cols-5 gap-2">
        {Array.from({ length: WORD_LENGTH }).map((_, i) => (
          <Tile key={i} letter="" status="empty" />
        ))}
      </div>
    );
  }

  return <div className="grid gap-2" role="grid" aria-label="Wordle board">{rows}</div>;
});

