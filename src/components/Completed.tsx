import React from 'react';

interface CompletedProps {
  completedPomodoros: number;
  // Previously this accepted current focusTime; now we accept the accumulated minutes
  totalFocusMinutes: number;
}

export default function Completed({ completedPomodoros, totalFocusMinutes }: CompletedProps) {
  const completedSets = Math.floor(completedPomodoros / 4);

  // Use the totalFocusMinutes stored at time of completion (immutable when settings change)
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const remainingMinutes = totalFocusMinutes % 60;

  return (
    <div className="w-full h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0 overflow-hidden">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Completed</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Pomodoros</span>
          <span className="text-2xl font-bold text-red-600">{completedPomodoros}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-700">Sets</span>
          <span className="text-2xl font-bold text-blue-600">{completedSets}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Focus Time</span>
          <span className="text-lg font-bold text-green-600">
            {focusHours > 0 ? `${focusHours}h ` : ''}{remainingMinutes}m
          </span>
        </div>
      </div>
    </div>
  );
}
