import React from 'react';

export default function Header() {
  // Centralized share configuration
  const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  const SHARE_TEXT = 'Try this free, ad-free, open-source Pomodoro Timer & Task Tracker! No signups, no ads, just productivity. 🎯';
  
  // Feedback link - UPDATE THIS WHEN READY
  const FEEDBACK_LINK = 'https://forms.google.com/your-form-id'; // Replace with your actual feedback form link

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

  const handleRedditShare = () => {
    const title = encodeURIComponent('Pomodoro Timer & Task Tracker');
    const url = encodeURIComponent(APP_URL);
    window.open(`https://reddit.com/submit?title=${title}&url=${url}`, '_blank', 'width=850,height=600');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(APP_URL);
    const quote = encodeURIComponent(SHARE_TEXT);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=550,height=420');
  };

  const handleFeedback = () => {
    window.open(FEEDBACK_LINK, '_blank');
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Title Row */}
        <div className="flex items-center justify-center mb-4 relative">
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
        
        {/* Buttons Row */}
        <div className="flex justify-center space-x-4">
          <div className="flex items-center justify-center gap-3 m-0">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900">SHARE</h3>
          </div>
          {/* Email Button */}
          <button 
            onClick={handleEmailShare}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
            aria-label="Share via Email"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </button>
          
          {/* X Button */}
          <button 
            onClick={handleTwitterShare}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all hover:scale-105"
            aria-label="Share on X (Twitter)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>

          {/* Facebook Button */}
          <button 
            onClick={handleFacebookShare}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
            aria-label="Share on Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>

          {/* Reddit Button */}
          <button 
            onClick={handleRedditShare}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all hover:scale-105"
            aria-label="Share on Reddit"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
