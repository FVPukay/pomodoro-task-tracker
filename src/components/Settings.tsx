'use client';

import React, { useState } from 'react';

interface SettingsProps {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  onFocusTimeChange: (time: number) => void;
  onShortBreakTimeChange: (time: number) => void;
  onLongBreakTimeChange: (time: number) => void;
  isTimerRunning: boolean;
  onReset: () => void;
}

export default function Settings({
  focusTime,
  shortBreakTime,
  longBreakTime,
  onFocusTimeChange,
  onShortBreakTimeChange,
  onLongBreakTimeChange,
  isTimerRunning,
  onReset
}: SettingsProps) {
  const [savedMessage, setSavedMessage] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);

  const showSavedMessage = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(''), 2000);
  };

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

  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Clamp between 1 and 90 minutes
    const time = isNaN(value) ? 25 : Math.min(Math.max(value, 1), 90);
    onFocusTimeChange(time);
    showSavedMessage('Focus time saved!');
  };

  const handleShortBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Clamp between 1 and 15 minutes
    const time = isNaN(value) ? 5 : Math.min(Math.max(value, 1), 15);
    onShortBreakTimeChange(time);
    showSavedMessage('Short break saved!');
  };

  const handleLongBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Clamp between 1 and 60 minutes
    const time = isNaN(value) ? 30 : Math.min(Math.max(value, 1), 60);
    onLongBreakTimeChange(time);
    showSavedMessage('Long break saved!');
  };

  return (
    <>
      <div className="w-full h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0 overflow-hidden flex flex-col">

        <div className="flex justify-between items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <button
            onClick={handleResetClick}
            disabled={isTimerRunning}
            className={`text-xs font-medium px-2.5 py-1 rounded shadow-sm flex-shrink-0 transition-all ${
              isTimerRunning
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'text-white bg-red-500 hover:bg-red-700 hover:shadow-md'
            }`}
            aria-label="Reset settings to defaults"
          >
            Reset
          </button>
        </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Focus</span>
          <div className="flex items-center">
            <input
              type="number"
              value={focusTime}
              onChange={handleFocusChange}
              disabled={isTimerRunning}
              className={`w-16 h-8 text-center text-sm border border-gray-300 rounded focus:border-blue-500 ${
                isTimerRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-800'
              }`}
              min="1"
              max="90"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Short Break</span>
          <div className="flex items-center">
            <input
              type="number"
              value={shortBreakTime}
              onChange={handleShortBreakChange}
              disabled={isTimerRunning}
              className={`w-16 h-8 text-center text-sm border border-gray-300 rounded focus:border-blue-500 ${
                isTimerRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-800'
              }`}
              min="1"
              max="15"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Long Break</span>
          <div className="flex items-center">
            <input
              type="number"
              value={longBreakTime}
              onChange={handleLongBreakChange}
              disabled={isTimerRunning}
              className={`w-16 h-8 text-center text-sm border border-gray-300 rounded focus:border-blue-500 ${
                isTimerRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-800'
              }`}
              min="1"
              max="60"
            />
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="text-center mt-auto">
          <span className="text-sm text-green-600 font-medium animate-flash">
            {savedMessage}
          </span>
        </div>
      )}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Reset Settings to Defaults?</h3>
          <p className="text-gray-600 mb-6">
            This will reset all settings to their default values (Focus: 25 mins, Short Break: 5 mins, Long Break: 30 mins). This action cannot be undone.
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
