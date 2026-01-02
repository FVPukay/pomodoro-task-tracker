'use client';

import React, { useState } from 'react';

interface CompletedProps {
  completedPomodoros: number;
  totalFocusMinutes: number;
  onReset: () => void;
}

export default function Completed({ completedPomodoros, totalFocusMinutes, onReset }: CompletedProps) {
  const [showDialog, setShowDialog] = useState(false);
  const completedSets = Math.floor(completedPomodoros / 4);

  // Use the totalFocusMinutes stored at time of completion (immutable when settings change)
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const remainingMinutes = totalFocusMinutes % 60;

  const handleResetClick = () => {
    setShowDialog(true);
  };

  const handleConfirmReset = () => {
    onReset();
    setShowDialog(false);
  };

  const handleCancelReset = () => {
    setShowDialog(false);
  };

  return (
    <>
      <div className="w-full h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0 overflow-hidden">
        <div className="flex justify-between items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Completed</h2>
          <button
            onClick={handleResetClick}
            className="text-xs font-medium text-white bg-red-500 hover:bg-red-700 transition-all px-2.5 py-1 rounded shadow-sm hover:shadow-md flex-shrink-0"
            aria-label="Reset completed stats"
          >
            Reset
          </button>
        </div>

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

      {/* Transparent Dialog Overlay */}
      {showDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
          onClick={handleCancelReset}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Reset Completed Stats?</h3>
            <p className="text-gray-600 mb-6">
              This will reset all completed pomodoros, sets, and total focus time to zero. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelReset}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
