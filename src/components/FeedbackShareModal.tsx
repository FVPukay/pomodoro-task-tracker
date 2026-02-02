'use client';

import React, { useEffect } from 'react';

interface FeedbackShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackShareModal({ isOpen, onClose }: FeedbackShareModalProps) {
  // Share configuration (matches previous implementation)
  const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  const SHARE_TEXT = 'Try this free, ad-free, open-source Pomodoro Timer & Task Tracker! No signups, no ads, just productivity. 🎯';
  const FEEDBACK_LINK = 'https://github.com/FVPukay/pomodoro-task-tracker/issues';

  // Share handlers (from previous implementation)
  const handleEmailShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent('Check out this Pomodoro Timer!');
    const body = encodeURIComponent(`${SHARE_TEXT}\n\n${APP_URL}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(SHARE_TEXT);
    const url = encodeURIComponent(APP_URL);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(APP_URL);
    const quote = encodeURIComponent(SHARE_TEXT);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=550,height=420');
  };

  const handleRedditShare = () => {
    const title = encodeURIComponent('Pomodoro Timer & Task Tracker');
    const url = encodeURIComponent(APP_URL);
    window.open(`https://reddit.com/submit?title=${title}&url=${url}`, '_blank', 'width=850,height=600');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(APP_URL);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=420');
  };

  const handleFeedback = () => {
    window.open(FEEDBACK_LINK, '_blank');
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap - focus modal when opened
  useEffect(() => {
    if (isOpen) {
      const modal = document.getElementById('feedback-share-modal');
      if (modal) {
        modal.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        id="feedback-share-modal"
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Feedback Section */}
        <div className="px-6 pb-6">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>💬</span> Feedback
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Found a bug or have an idea? We&apos;d love to hear from you.
          </p>
          <button
            onClick={handleFeedback}
            className="w-full bg-purple-600 text-white hover:bg-purple-700 rounded-lg px-4 py-2 transition-colors font-medium"
          >
            Open GitHub Issues →
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Share Section */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📤</span> Share
          </h2>

          {/* Share icons */}
          <div className="flex gap-3 mb-3 justify-center">
            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              aria-label="Share via Email"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleLinkedInShare}
              className="text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-lg p-2 transition-all"
              aria-label="Share on LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={handleTwitterShare}
              className="text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg p-2 transition-all"
              aria-label="Share on X (Twitter)"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              aria-label="Share on Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Reddit */}
            <button
              onClick={handleRedditShare}
              className="text-gray-500 hover:text-orange-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              aria-label="Share on Reddit"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Free, ad-free, open source 🍅
          </p>
        </div>
      </div>
    </div>
  );
}
