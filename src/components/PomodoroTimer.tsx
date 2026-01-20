"use client";

import React, { useState, useEffect } from 'react';
import { loadStats, saveStats } from '@/lib/storage/pomodoroStorage';

interface PomodoroTimerProps {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  completedPomodoros: number;
  onPomodoroComplete: (sessionCount: number, addedMinutes?: number) => void;
  onRunningChange: (isRunning: boolean) => void;
}

export default function PomodoroTimer({
  focusTime,
  shortBreakTime,
  longBreakTime,
  completedPomodoros,
  onPomodoroComplete,
  onRunningChange
}: PomodoroTimerProps) {
  // Initialize with server-safe defaults to prevent hydration mismatch
  const [isRunning, setIsRunning] = useState<boolean>(false); // Never restore running state
  const [isFocusSession, setIsFocusSession] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(focusTime * 60);
  const [isPaused, setIsPaused] = useState<boolean>(false); // Never restore paused state
  const [sessionStartFocusTime, setSessionStartFocusTime] = useState<number | null>(null); // Tracks initial commitment

  // Play completion sound using Web Audio API - Triple Ascending Chime
  const playCompletionSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();

      // Three ascending tones for uplifting, positive feeling
      const tones = [
        { freq: 600, delay: 0 },
        { freq: 800, delay: 0.15 },
        { freq: 1000, delay: 0.3 }
      ];

      tones.forEach((tone) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = tone.freq;
          oscillator.type = 'sine';

          // Smooth envelope for chime-like sound
          const now = audioContext.currentTime;
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          oscillator.start(now);
          oscillator.stop(now + 0.3);
        }, tone.delay * 1000);
      });
    } catch (error) {
      console.error('Failed to play completion sound:', error);
    }
  };

  // Load from localStorage after hydration
  useEffect(() => {
    const stats = loadStats(focusTime);
    setIsFocusSession(stats.isFocusSession);
    setTimeLeft(stats.timeLeft);
    setSessionStartFocusTime(stats.sessionStartFocusTime);
  }, [focusTime]);

  // Capture initial focus time when starting a NEW focus session
  useEffect(() => {
    if (isRunning && isFocusSession && sessionStartFocusTime === null) {
      // Starting a new focus session - record the commitment
      setSessionStartFocusTime(focusTime);
    }
  }, [isRunning, isFocusSession, sessionStartFocusTime, focusTime]);

  // Notify parent when running state changes
  useEffect(() => {
    onRunningChange(isRunning);
  }, [isRunning, onRunningChange]);

  // Prevent accidental browser refresh when timer is running or paused
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning || isPaused) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, isPaused]);

  // Persist timer state to localStorage whenever it changes
  useEffect(() => {
    saveStats({
      isRunning,
      isFocusSession,
      timeLeft,
      isPaused,
      sessionStartFocusTime,
    });
  }, [isRunning, isFocusSession, timeLeft, isPaused, sessionStartFocusTime]);

  // Update timer display when settings change (only if timer is fully stopped, not paused)
  useEffect(() => {
    // Only sync when timer is fully stopped (not running AND not paused)
    if (!isRunning && !isPaused) {
      if (isFocusSession) {
        setTimeLeft(focusTime * 60);
      } else {
        // Determine which break type based on completed pomodoros
        const breakTime = (completedPomodoros > 0 && completedPomodoros % 4 === 0)
          ? longBreakTime
          : shortBreakTime;
        setTimeLeft(breakTime * 60);
      }
    }
  }, [focusTime, shortBreakTime, longBreakTime, isRunning, isPaused, isFocusSession, completedPomodoros]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined = undefined;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }

    // When timeLeft reaches zero, transition
    if (timeLeft === 0) {
      if (interval) {
        clearInterval(interval);
      }

      if (isFocusSession) {
        // a focus session completed
        playCompletionSound(); // Play notification sound
        const updatedCount = completedPomodoros + 1;
        // Tell parent that a pomodoro completed - use the INITIAL commitment, not current setting
        const minutesToRecord = sessionStartFocusTime ?? focusTime; // Fallback to current if somehow null
        onPomodoroComplete(updatedCount, minutesToRecord);
        setIsFocusSession(false);
        // Clear the session start time since focus session is complete
        setSessionStartFocusTime(null);
        // Long break only after 4th, 8th, 12th, etc. pomodoro
        setTimeLeft(updatedCount % 4 === 0 ? longBreakTime * 60 : shortBreakTime * 60);
      } else {
        // break finished -> go back to focus
        setIsFocusSession(true);
        setTimeLeft(focusTime * 60);
        // sessionStartFocusTime remains null - will be set when new focus session starts
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // Note: include focusTime, shortBreakTime, longBreakTime so timer durations respond properly
  }, [isRunning, timeLeft, isFocusSession, completedPomodoros, focusTime, shortBreakTime, longBreakTime, onPomodoroComplete, sessionStartFocusTime]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    // Single responsibility: Only reset the current timer, don't change mode or stats
    setIsRunning(false);
    setIsPaused(false);
    // Clear session start time - user is abandoning this session
    setSessionStartFocusTime(null);
    // Reset to current mode's time (don't switch modes)
    if (isFocusSession) {
      setTimeLeft(focusTime * 60);
    } else {
      // Determine which break type based on completed pomodoros
      // Long break only after 4th, 8th, 12th, etc. pomodoro
      const breakTime = (completedPomodoros > 0 && completedPomodoros % 4 === 0) ? longBreakTime : shortBreakTime;
      setTimeLeft(breakTime * 60);
    }
    // Don't call onPomodoroComplete
  };

  const handleSkip = () => {
    // Single responsibility: Only switch mode, preserve running state
    // Clear session start time - user is abandoning current session
    setSessionStartFocusTime(null);
    if (isFocusSession) {
      // Switch to break
      setIsFocusSession(false);
      // Long break only after 4th, 8th, 12th, etc. pomodoro
      const breakTime = (completedPomodoros > 0 && completedPomodoros % 4 === 0) ? longBreakTime : shortBreakTime;
      setTimeLeft(breakTime * 60);
    } else {
      // Switch to focus
      setIsFocusSession(true);
      setTimeLeft(focusTime * 60);
    }
    // Don't change isRunning - preserve current running state
    // Don't call onPomodoroComplete - this is a manual skip, not a completion
  };

  // Calculate progress for outer progress bar
  // Use sessionStartFocusTime (committed time) when available to prevent
  // progress bars from jumping when settings change mid-session
  const getTotalTime = () => {
    if (isFocusSession) {
      // Use committed time if session is in progress, otherwise use current setting
      return (sessionStartFocusTime ?? focusTime) * 60;
    } else {
      return (completedPomodoros > 0 && completedPomodoros % 4 === 0)
        ? longBreakTime * 60
        : shortBreakTime * 60;
    }
  };

  const totalTime = getTotalTime();
  // Only show progress during focus sessions
  const progress = isFocusSession && totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  // SVG circle calculations - using viewBox coordinate system
  const centerX = 160;
  const centerY = 160;
  const progressRadius = 144; // Radius for progress ring
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * progressRadius;
  // Only extend progress to close gap when at 100% (timeLeft === 0)
  const extendedProgress = timeLeft === 0 && progress >= 99 ? 101.5 : progress;
  const strokeDashoffset = circumference * (1 - extendedProgress / 100);
  const blackCircleRadius = progressRadius - (strokeWidth / 2); // Black circle sits inside the progress ring

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center p-6 min-w-0 overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">

        {/* Timer with integrated progress bar */}
        <div className="relative w-48 sm:w-72 md:w-80 lg:w-96 aspect-square">
          {/* SVG for progress ring and black circle */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
            <defs>
              {/* Option 8 gradient: Red → Crimson → Purple */}
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>

            {/* Black circle background */}
            <circle
              cx={centerX}
              cy={centerY}
              r={blackCircleRadius}
              fill="black"
              className="shadow-lg"
            />

            {/* Progress background ring - always visible */}
            <circle
              cx={centerX}
              cy={centerY}
              r={progressRadius}
              fill="none"
              stroke="#374151"
              strokeWidth={strokeWidth}
              transform={`rotate(-89 ${centerX} ${centerY})`}
            />

            {/* Progress bar with Option 8 gradient */}
            <circle
              cx={centerX}
              cy={centerY}
              r={progressRadius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-89 ${centerX} ${centerY})`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          {/* Timer content overlaid on top */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">

          <div className="absolute" style={{ top: '18%' }}>
            <span className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-medium">
                {isFocusSession ? 'Focus' : 'Break'}
            </span>
          </div>

          <div className="absolute" style={{ top: '32%' }}>
            <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>

          {/* Pomodoro Circles */}
          <div className="absolute flex gap-1 sm:gap-1.5 md:gap-2" style={{ top: '54%' }}>
            {[0, 1, 2, 3].map((index) => {
              // Show all 4 circles as completed during long break, reset at start of next focus session
              // Only show all 4 if we've actually completed at least one pomodoro (not when completedPomodoros=0)
              const pomodoroInSet = (completedPomodoros % 4 === 0 && completedPomodoros > 0 && !isFocusSession)
                ? 4
                : completedPomodoros % 4;
              const isCompleted = index < pomodoroInSet;
              const isActive = index === pomodoroInSet && isFocusSession;

              // Calculate progress percentage for active circle
              const circleProgress = isActive && totalTime > 0
                ? ((totalTime - timeLeft) / totalTime) * 100
                : 0;

              // Calculate clip-path for sweep effect (starts at top, goes clockwise)
              const getClipPath = (progress: number) => {
                if (progress <= 0) return 'polygon(50% 50%, 50% 0%, 50% 0%)';
                if (progress >= 100) return 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)';

                const angle = (progress / 100) * 360;

                if (angle <= 90) {
                  // First quadrant: top to right
                  const x = 50 + (50 * Math.tan((angle * Math.PI) / 180));
                  return `polygon(50% 50%, 50% 0%, ${x}% 0%)`;
                } else if (angle <= 180) {
                  // Second quadrant: right to bottom
                  const y = 50 + (50 * Math.tan(((angle - 90) * Math.PI) / 180));
                  return `polygon(50% 50%, 50% 0%, 100% 0%, 100% ${y}%)`;
                } else if (angle <= 270) {
                  // Third quadrant: bottom to left
                  const x = 50 - (50 * Math.tan(((angle - 180) * Math.PI) / 180));
                  return `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, ${x}% 100%)`;
                } else {
                  // Fourth quadrant: left to top
                  const y = 50 - (50 * Math.tan(((angle - 270) * Math.PI) / 180));
                  return `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${y}%)`;
                }
              };

              return (
                <div
                  key={index}
                  className="relative w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded-full overflow-hidden"
                  style={{
                    background: 'black',
                    border: isCompleted ? 'none' : '1.5px solid #EF4444'
                  }}
                >
                  {/* Red fill for completed circles or swept area for in-progress */}
                  {(isCompleted || isActive) && (
                    <div
                      className="absolute"
                      style={{
                        inset: '-2px',
                        background: '#EF4444',
                        clipPath: isCompleted ? 'none' : getClipPath(circleProgress),
                        transition: isActive ? 'clip-path 0.5s linear' : 'none',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute flex items-center space-x-2 sm:space-x-3 md:space-x-4" style={{ bottom: '16%' }}>

            {/* Buttons - responsive sizing */}
            <button
              onClick={handleReset}
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 border-purple-400 hover:border-purple-300 transition-all"
              style={{ background: 'linear-gradient(to right, #2dd4bf, #a855f7)' }}
              aria-label="Reset timer"
            >
              <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={handleStartPause}
              className="w-10 h-10 sm:w-13 sm:h-13 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center border-2 border-purple-400 hover:border-purple-300 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(to right, #2dd4bf, #a855f7)' }}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <svg className="w-4 h-4 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 border-purple-400 hover:border-purple-300 transition-all"
              style={{ background: 'linear-gradient(to right, #2dd4bf, #a855f7)' }}
              aria-label="Skip session"
            >
              <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
