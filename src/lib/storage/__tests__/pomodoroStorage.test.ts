// src/lib/storage/__tests__/pomodoroStorage.test.ts

import {
  saveStats,
  loadStats,
  saveSettings,
  loadSettings,
  saveCompleted,
  loadCompleted,
  PomodoroStats,
  PomodoroSettings,
  CompletedStats,
} from '../pomodoroStorage';

describe('Pomodoro Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Settings Storage', () => {
    it('should save and load settings', () => {
      const settings: PomodoroSettings = {
        focusTime: 30,
        shortBreakTime: 10,
        longBreakTime: 45,
      };

      saveSettings(settings);
      const loaded = loadSettings();

      expect(loaded).toEqual(settings);
    });

    it('should return default settings if localStorage is empty', () => {
      const loaded = loadSettings();

      expect(loaded).toEqual({
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 30,
      });
    });
  });

  describe('Stats Storage (with endTime)', () => {
    it('should save and load stats with endTime', () => {
      const now = Date.now();
      const stats: PomodoroStats = {
        isRunning: true,
        isFocusSession: true,
        timeLeft: 1200,
        isPaused: false,
        sessionStartFocusTime: 25,
        endTime: now + 1200000, // 20 minutes from now
      };

      saveStats(stats);
      const loaded = loadStats(25);

      expect(loaded.isFocusSession).toBe(true);
      expect(loaded.timeLeft).toBe(1200);
      expect(loaded.sessionStartFocusTime).toBe(25);
      expect(loaded.endTime).toBe(now + 1200000);
      // isRunning and isPaused should never be restored
      expect(loaded.isRunning).toBe(false);
      expect(loaded.isPaused).toBe(false);
    });

    it('should restore endTime as null if not present in stored data', () => {
      const stats: PomodoroStats = {
        isRunning: false,
        isFocusSession: true,
        timeLeft: 1500,
        isPaused: false,
        sessionStartFocusTime: null,
        endTime: null,
      };

      saveStats(stats);
      const loaded = loadStats(25);

      expect(loaded.endTime).toBeNull();
    });

    it('should handle endTime in paused state', () => {
      const stats: PomodoroStats = {
        isRunning: false,
        isFocusSession: true,
        timeLeft: 900,
        isPaused: true,
        sessionStartFocusTime: 25,
        endTime: null, // endTime should be null when paused
      };

      saveStats(stats);
      const loaded = loadStats(25);

      expect(loaded.endTime).toBeNull();
      expect(loaded.timeLeft).toBe(900);
    });

    it('should return default stats with endTime null if localStorage is empty', () => {
      const loaded = loadStats(25);

      expect(loaded).toEqual({
        isRunning: false,
        isFocusSession: true,
        timeLeft: 25 * 60,
        isPaused: false,
        sessionStartFocusTime: null,
        endTime: null,
      });
    });

    it('should handle missing endTime field in legacy stored data', () => {
      // Simulate legacy data without endTime field
      const legacyData = {
        isRunning: true,
        isFocusSession: false,
        timeLeft: 300,
        isPaused: false,
        sessionStartFocusTime: null,
        // endTime is missing
      };

      localStorage.setItem('pomodoro-stats', JSON.stringify(legacyData));
      const loaded = loadStats(25);

      expect(loaded.endTime).toBeNull();
      expect(loaded.timeLeft).toBe(300);
      expect(loaded.isFocusSession).toBe(false);
    });
  });

  describe('Completed Stats Storage', () => {
    it('should save and load completed stats', () => {
      const completed: CompletedStats = {
        completedPomodoros: 5,
        totalFocusMinutes: 125,
      };

      saveCompleted(completed);
      const loaded = loadCompleted();

      expect(loaded).toEqual(completed);
    });

    it('should return default completed stats if localStorage is empty', () => {
      const loaded = loadCompleted();

      expect(loaded).toEqual({
        completedPomodoros: 0,
        totalFocusMinutes: 0,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('pomodoro-stats', 'invalid json data');
      const loaded = loadStats(25);

      // Should return defaults when JSON parsing fails
      expect(loaded.endTime).toBeNull();
      expect(loaded.timeLeft).toBe(25 * 60);
    });

    it('should preserve endTime through multiple save/load cycles', () => {
      const endTime1 = Date.now() + 60000;
      saveStats({
        isRunning: true,
        isFocusSession: true,
        timeLeft: 60,
        isPaused: false,
        sessionStartFocusTime: 25,
        endTime: endTime1,
      });

      const loaded1 = loadStats(25);
      expect(loaded1.endTime).toBe(endTime1);

      // Update endTime
      const endTime2 = Date.now() + 120000;
      saveStats({
        ...loaded1,
        endTime: endTime2,
      });

      const loaded2 = loadStats(25);
      expect(loaded2.endTime).toBe(endTime2);
    });
  });
});
