import React, { useState } from 'react';

interface SettingsProps {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  onFocusTimeChange: (time: number) => void;
  onShortBreakTimeChange: (time: number) => void;
  onLongBreakTimeChange: (time: number) => void;
  isTimerRunning: boolean;
}

export default function Settings({
  focusTime,
  shortBreakTime,
  longBreakTime,
  onFocusTimeChange,
  onShortBreakTimeChange,
  onLongBreakTimeChange,
  isTimerRunning
}: SettingsProps) {
  const [savedMessage, setSavedMessage] = useState<string>('');

  const showSavedMessage = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(''), 2000);
  };

  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value) || 25;
    onFocusTimeChange(time);
    showSavedMessage('Focus time saved!');
  };

  const handleShortBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value) || 5;
    onShortBreakTimeChange(time);
    showSavedMessage('Short break saved!');
  };

  const handleLongBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value) || 30;
    onLongBreakTimeChange(time);
    showSavedMessage('Long break saved!');
  };

  return (
    <div className="w-full h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0 overflow-hidden flex flex-col">
      
      <h2 className="text-lg font-semibold m-0 text-gray-800 flex items-center justify-between mb-4">Settings
        <span className="text-xs text-slate-500 ml-2 mr-4">mins</span>
      </h2>

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
              max="60"
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
              max="30"
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
  );
}
