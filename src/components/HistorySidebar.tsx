"use client";
import React, { useState, useEffect } from "react";
import { getHistoryDays, getDayIndex } from "@/lib/wordle";
import { cn } from "@/lib/utils";

type HistorySidebarProps = {
  selectedDayIndex: number | null;
  onDaySelect: (dayIndex: number | null) => void;
};

export function HistorySidebar({ selectedDayIndex, onDaySelect }: HistorySidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed
  const [isMounted, setIsMounted] = useState(false);
  const historyDays = getHistoryDays(30);
  const currentDayIndex = getDayIndex();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent SSR mismatch
  }

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 transition-transform duration-300 z-50 w-80"
        style={{ 
          transform: isExpanded ? 'translateX(0)' : 'translateX(-100%)',
          visibility: isMounted ? 'visible' : 'hidden'
        }}
      >
        {/* Tab */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-20 bg-gray-800 text-white px-2 py-3 rounded-r-md border border-l-0 border-gray-600 hover:bg-gray-700 transition-all"
          style={{ 
            left: isExpanded ? '320px' : '0px',
            transform: isExpanded ? 'translateX(0)' : 'translateX(0)'
          }}
        >
          <div className="writing-mode-vertical-rl text-sm font-medium">
            History
          </div>
        </button>

        {/* Sidebar Content */}
        <div className="h-full overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Game History</h2>
            <p className="text-sm text-gray-400 mt-1">
              Choose a previous day to play
            </p>
          </div>

          <div className="p-2">
            {historyDays.map(({ dayIndex, date, solution }) => (
              <button
                key={dayIndex}
                onClick={() => {
                  onDaySelect(dayIndex === currentDayIndex ? null : dayIndex);
                  setIsExpanded(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-md mb-1 transition-colors",
                  "hover:bg-gray-800",
                  selectedDayIndex === dayIndex || (selectedDayIndex === null && dayIndex === currentDayIndex)
                    ? "bg-blue-600 text-white"
                    : "text-gray-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {formatDate(date)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Word: {solution}
                    </div>
                  </div>
                  {dayIndex === currentDayIndex && (
                    <span className="text-xs bg-green-600 px-2 py-1 rounded">
                      Today
                    </span>
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