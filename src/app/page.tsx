"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PomodoroTimer from '@/components/PomodoroTimer';
import Settings from '@/components/Settings';
import Completed from '@/components/Completed';
import Tasks from '@/components/Tasks';
import {
  loadSettings,
  loadCompleted,
  saveSettings,
  saveCompleted,
} from '@/lib/storage/pomodoroStorage';

export default function Home() {
  // Initialize with server-safe defaults to prevent hydration mismatch
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(0);
  const [focusTime, setFocusTime] = useState<number>(25);
  const [shortBreakTime, setShortBreakTime] = useState<number>(5);
  const [longBreakTime, setLongBreakTime] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Load from localStorage after hydration
  useEffect(() => {
    const completed = loadCompleted();
    setCompletedPomodoros(completed.completedPomodoros);
    setTotalFocusMinutes(completed.totalFocusMinutes);

    const settings = loadSettings();
    setFocusTime(settings.focusTime);
    setShortBreakTime(settings.shortBreakTime);
    setLongBreakTime(settings.longBreakTime);
  }, []);

  // Track site visit on mount (once per 24 hours)
  useEffect(() => {
    const lastVisitTimestamp = localStorage.getItem('last_visit_timestamp');
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Track visit if no previous visit OR last visit was >24 hours ago
    if (!lastVisitTimestamp || (now - parseInt(lastVisitTimestamp)) > TWENTY_FOUR_HOURS) {
      // Set timestamp IMMEDIATELY to prevent race condition in React Strict Mode
      localStorage.setItem('last_visit_timestamp', now.toString());

      fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'visits' }),
      })
        .catch(err => console.error('Failed to track visit:', err));
    }
  }, []);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    saveSettings({ focusTime, shortBreakTime, longBreakTime });
  }, [focusTime, shortBreakTime, longBreakTime]);

  // Persist completed stats to localStorage whenever they change
  useEffect(() => {
    saveCompleted({ completedPomodoros, totalFocusMinutes });
  }, [completedPomodoros, totalFocusMinutes]);

  // Now receives addedMinutes so we can accumulate minutes when a pomodoro completes.
  const handlePomodoroComplete = (sessionCount: number, addedMinutes?: number) => {
    // If called with sessionCount === 0 and addedMinutes === 0 -> treat as reset
    if (sessionCount === 0 && addedMinutes === 0) {
      setCompletedPomodoros(0);
      setTotalFocusMinutes(0);
      return;
    }

    // Normal update: set new session count and add the minutes that were just completed
    setCompletedPomodoros(sessionCount);

    if (addedMinutes != undefined && addedMinutes > 0) {
      setTotalFocusMinutes((prev) => prev + addedMinutes);

      // Track pomodoro completion in analytics
      fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'pomodoros' }),
      })
        .catch(err => console.error('Failed to track pomodoro:', err));
    }
  };

  const handleResetCompleted = () => {
    setCompletedPomodoros(0);
    setTotalFocusMinutes(0);
  };

  const handleResetSettings = () => {
    setFocusTime(25);
    setShortBreakTime(5);
    setLongBreakTime(30);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}
    >
      <Header />

      <main className="max-w-full mx-auto px-4 py-3">
        {/* responsive grid: one column on small screens, two columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[calc(100vh-90px)]">

          {/* Left column */}
          <div className="flex flex-col min-w-0">
            {/* Timer area - allow it to grow */}
            <div className="flex-1 mb-2 min-w-0">
              <PomodoroTimer
                focusTime={focusTime}
                shortBreakTime={shortBreakTime}
                longBreakTime={longBreakTime}
                completedPomodoros={completedPomodoros}
                onPomodoroComplete={handlePomodoroComplete}
                onRunningChange={setIsTimerRunning}
              />
            </div>

            {/* Settings + Completed row - responsive */}
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <Settings
                  focusTime={focusTime}
                  shortBreakTime={shortBreakTime}
                  longBreakTime={longBreakTime}
                  onFocusTimeChange={setFocusTime}
                  onShortBreakTimeChange={setShortBreakTime}
                  onLongBreakTimeChange={setLongBreakTime}
                  isTimerRunning={isTimerRunning}
                  onReset={handleResetSettings}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Completed
                  completedPomodoros={completedPomodoros}
                  totalFocusMinutes={totalFocusMinutes}
                  onReset={handleResetCompleted}
                />
              </div>
            </div>
          </div>

          {/* Right column - max-height prevents expansion, Tasks scrolls internally */}
          <div className="flex flex-col min-w-0 h-full max-h-[500px] md:max-h-[700px]">
            <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
              <Tasks />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
