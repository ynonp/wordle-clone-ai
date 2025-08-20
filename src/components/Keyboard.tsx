"use client";
import React from "react";
import { LetterStatus } from "@/lib/wordle";
import { cn } from "@/lib/utils";

const ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","DEL"],
];

const statusClass: Record<LetterStatus, string> = {
  correct: "bg-green-600 text-white border-green-600",
  present: "bg-yellow-500 text-white border-yellow-500",
  absent: "bg-gray-700 text-white border-gray-700",
  empty: "bg-gray-500/20 text-white border-gray-500/30",
};

export type KeyboardProps = {
  keyStatuses: Record<string, LetterStatus>;
  onKey: (key: string) => void;
};

function Key({ label, status, onClick }: { label: string; status: LetterStatus; onClick: () => void }) {
  const isWide = label === "ENTER" || label === "DEL";
  return (
    <button
      type="button"
      className={cn(
        "h-12 select-none rounded border px-2 text-sm font-semibold uppercase md:text-base",
        isWide ? "col-span-2" : "",
        statusClass[status]
      )}
      onClick={onClick}
      aria-label={`key ${label}`}
    >
      {label}
    </button>
  );
}

export const Keyboard = React.memo(function Keyboard({ keyStatuses, onKey }: KeyboardProps) {
  return (
    <div className="mt-4 space-y-2" aria-label="On-screen keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="grid grid-cols-10 gap-2">
          {row.map((label) => {
            const status = /^[A-Z]$/.test(label) ? (keyStatuses[label] ?? "empty") : "empty";
            return (
              <Key
                key={label}
                label={label}
                status={status}
                onClick={() => onKey(label)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});
