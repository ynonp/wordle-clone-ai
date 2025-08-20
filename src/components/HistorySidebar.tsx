"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar, Check, X } from "lucide-react";

type HistoryDay = {
  dayIndex: number;
  solution: string;
  date: Date;
  played?: boolean;
  won?: boolean;
};

type HistorySidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  historyDays: HistoryDay[];
  currentDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
  selectedDayIndex?: number;
};

export function HistorySidebar({ 
  isOpen, 
  onToggle, 
  historyDays, 
  currentDayIndex, 
  onSelectDay,
  selectedDayIndex 
}: HistorySidebarProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <>
      {/* Sidebar - only render when open */}
      {isOpen && (
        <>
          <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-700 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  History
                </h2>
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                  aria-label="Close history"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
                {/* Current day */}
                <div
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedDayIndex === currentDayIndex || selectedDayIndex === undefined
                      ? "bg-blue-900 border-blue-600"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  )}
                  onClick={() => onSelectDay(currentDayIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-blue-400">Today</div>
                      <div className="text-sm text-gray-300">
                        {formatDate(new Date())}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Current
                    </div>
                  </div>
                </div>

                {/* Historical days */}
                {historyDays.map((day) => (
                  <div
                    key={day.dayIndex}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedDayIndex === day.dayIndex
                        ? "bg-blue-900 border-blue-600"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    )}
                    onClick={() => onSelectDay(day.dayIndex)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">
                          {formatDate(day.date)}
                        </div>
                        <div className="text-sm text-gray-300">
                          {day.solution}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {day.played && (
                          day.won ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onToggle}
          />
        </>
      )}

      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors z-40"
          aria-label="Open history"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}