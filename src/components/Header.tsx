import React from 'react';

export default function Header() {
  // Feedback link
  const FEEDBACK_LINK = 'https://github.com/FVPukay/pomodoro-task-tracker/issues';

  const handleFeedback = () => {
    window.open(FEEDBACK_LINK, '_blank');
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Title Row - Only row in header */}
        <div className="flex items-center justify-center relative">
          <h1 className="text-2xl font-bold text-gray-800">
            Pomodoro Timer & Task Tracker
          </h1>
          {/* Feedback Button */}
          <button
            onClick={handleFeedback}
            className="ml-3 hover:text-gray-600 transition-all hover:scale-110"
            aria-label="Submit Feedback"
          >
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
