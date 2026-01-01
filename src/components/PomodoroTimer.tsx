"use client";

import React, { useState, useEffect } from 'react';
import { loadStats, saveStats } from '@/lib/storage/pomodoroStorage';

interface PomodoroTimerProps {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  // New signature: parent needs to know both updated session count and minutes added
  // Added minutes optional since in handleSkip not passing addedMinutes as an argument
  // Prevents total focus time from being incremented on skips
  onPomodoroComplete: (sessionCount: number, addedMinutes?: number) => void;
  onRunningChange: (isRunning: boolean) => void;
}

export default function PomodoroTimer({
  focusTime,
  shortBreakTime,
  longBreakTime,
  onPomodoroComplete,
  onRunningChange
}: PomodoroTimerProps) {
  // Initialize with server-safe defaults to prevent hydration mismatch
  const [isRunning, setIsRunning] = useState<boolean>(false); // Never restore running state
  const [isFocusSession, setIsFocusSession] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(focusTime * 60);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false); // Never restore paused state

  // Load from localStorage after hydration
  useEffect(() => {
    const stats = loadStats(focusTime);
    setIsFocusSession(stats.isFocusSession);
    setTimeLeft(stats.timeLeft);
    setSessionCount(stats.sessionCount);
  }, [focusTime]);

  // Notify parent when running state changes
  useEffect(() => {
    onRunningChange(isRunning);
  }, [isRunning, onRunningChange]);

  // Persist timer state to localStorage whenever it changes
  useEffect(() => {
    saveStats({
      sessionCount,
      isRunning,
      isFocusSession,
      timeLeft,
      isPaused,
    });
  }, [sessionCount, isRunning, isFocusSession, timeLeft, isPaused]);

  // Update timer display when settings change (only if not running and in focus session)
  useEffect(() => {
    if (!isRunning && isFocusSession) {
      if (!isPaused) setTimeLeft(focusTime * 60);
    }
  }, [focusTime, isRunning, isFocusSession, isPaused]);

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
        const updatedCount = sessionCount + 1;
        setSessionCount(updatedCount);
        // Tell parent that a pomodoro completed and how many minutes to add
        onPomodoroComplete(updatedCount, focusTime);
        setIsFocusSession(false);
        // Long break only after 4th, 8th, 12th, etc. pomodoro
        setTimeLeft(updatedCount % 4 === 0 ? longBreakTime * 60 : shortBreakTime * 60);
      } else {
        // break finished -> go back to focus
        setIsFocusSession(true);
        setTimeLeft(focusTime * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // Note: include focusTime, shortBreakTime, longBreakTime so timer durations respond properly
  }, [isRunning, timeLeft, isFocusSession, sessionCount, focusTime, shortBreakTime, longBreakTime, onPomodoroComplete]);

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
    // Reset to current mode's time (don't switch modes)
    if (isFocusSession) {
      setTimeLeft(focusTime * 60);
    } else {
      // Determine which break type based on session count
      // Long break only after 4th, 8th, 12th, etc. pomodoro
      const breakTime = (sessionCount > 0 && sessionCount % 4 === 0) ? longBreakTime : shortBreakTime;
      setTimeLeft(breakTime * 60);
    }
    // Don't reset sessionCount, don't call onPomodoroComplete
  };

  const handleSkip = () => {
    // Single responsibility: Only switch mode, preserve running state
    if (isFocusSession) {
      // Switch to break
      setIsFocusSession(false);
      // Long break only after 4th, 8th, 12th, etc. pomodoro
      const breakTime = (sessionCount > 0 && sessionCount % 4 === 0) ? longBreakTime : shortBreakTime;
      setTimeLeft(breakTime * 60);
    } else {
      // Switch to focus
      setIsFocusSession(true);
      setTimeLeft(focusTime * 60);
    }
    // Don't change isRunning - preserve current running state
    // Don't call onPomodoroComplete - this is a manual skip, not a completion
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center p-6 min-w-0 overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        
        {/* REVISED: Added aspect-square and removed all h-XX classes */}
        <div className="w-48 sm:w-72 
             md:w-80 
             lg:w-96 
             aspect-square /* FORCES height to equal width, preventing elongation */
             bg-black rounded-full flex flex-col items-center justify-center relative shadow-lg">
          
          <div className="absolute" style={{ top: '22%' }}>
            <span className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-medium">
                {isFocusSession ? 'Focus' : 'Break'}
            </span>
          </div>

          <div className="absolute" style={{ top: '38%' }}>
            <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>

          <div className="absolute flex items-center space-x-3 sm:space-x-4" style={{ bottom: '14%' }}>
            
            {/* ... Buttons (no changes needed here as they use w/h classes directly) ... */}
            <button
              onClick={handleReset}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 border-purple-400 hover:border-purple-300 transition-all"
              style={{ background: 'linear-gradient(to right, #2dd4bf, #a855f7)' }}
              aria-label="Reset timer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={handleStartPause}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center border-2 border-purple-400 hover:border-purple-300 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(to right, #2dd4bf, #a855f7)' }}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 border-purple-400 hover:border-purple-300 transition-all"
              style={{ background: 'linear-gradient(to right, #2dd4bf, #a855f7)' }}
              aria-label="Skip session"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
