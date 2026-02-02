'use client';

import { useState } from 'react';
import FeedbackShareModal from './FeedbackShareModal';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Title Row - Only row in header */}
        <div className="flex items-center justify-center relative">
          <h1 className="text-2xl font-bold text-gray-800">
            Pomodoro Timer & Task Tracker
          </h1>
          {/* Menu Button (opens modal with feedback & share) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-3 hover:text-gray-600 transition-all hover:scale-110"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Modal */}
      <FeedbackShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </header>
  );
}
