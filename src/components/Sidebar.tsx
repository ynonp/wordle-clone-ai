"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { GameHistory, getDayIndex } from "@/lib/wordle";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  gameHistory: GameHistory;
  currentDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
};

export function Sidebar({ isOpen, onClose, gameHistory, currentDayIndex, onSelectDay }: SidebarProps) {
  const historyDays = useMemo(() => {
    const today = getDayIndex();
    const days: Array<{
      dayIndex: number;
      date: string;
      hasGame: boolean;
      status?: "won" | "lost" | "playing";
      guessCount?: number;
    }> = [];

    // Show last 30 days or all days with games, whichever is more
    const maxDays = Math.max(30, Math.max(...Object.keys(gameHistory).map(Number)) + 1);
    
    for (let i = today; i >= Math.max(0, today - maxDays + 1); i--) {
      const game = gameHistory[i];
      const date = new Date(new Date("2022-01-01T00:00:00Z").getTime() + i * 24 * 60 * 60 * 1000);
      
      days.push({
        dayIndex: i,
        date: date.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric",
          year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
        }),
        hasGame: !!game,
        status: game?.status,
        guessCount: game?.guesses.length
      });
    }

    return days;
  }, [gameHistory]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-50 transform transition-transform duration-300 ease-in-out",
        "flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">History</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {historyDays.map((day) => (
              <button
                key={day.dayIndex}
                onClick={() => onSelectDay(day.dayIndex)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  currentDayIndex === day.dayIndex
                    ? "bg-blue-600 border-blue-500 text-white"
                    : day.hasGame
                    ? "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{day.date}</div>
                    {day.dayIndex === getDayIndex() && (
                      <div className="text-xs text-blue-400">Today</div>
                    )}
                  </div>
                  
                  {day.hasGame && (
                    <div className="text-right">
                      <div className={cn(
                        "text-xs font-medium",
                        day.status === "won" ? "text-green-400" :
                        day.status === "lost" ? "text-red-400" :
                        "text-yellow-400"
                      )}>
                        {day.status === "won" ? "Won" :
                         day.status === "lost" ? "Lost" :
                         "Playing"}
                      </div>
                      {day.guessCount !== undefined && (
                        <div className="text-xs text-gray-400">
                          {day.guessCount}/6 guesses
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!day.hasGame && (
                    <div className="text-xs text-gray-500">
                      Not played
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}