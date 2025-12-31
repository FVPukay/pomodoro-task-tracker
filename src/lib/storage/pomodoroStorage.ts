// src/lib/storage/pomodoroStorage.ts

export interface PomodoroSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
}

export interface PomodoroStats {
  sessionCount: number;
  isRunning: boolean;
  isFocusSession: boolean;
  timeLeft: number;
  isPaused: boolean;
}

export interface CompletedStats {
  completedPomodoros: number;
  totalFocusMinutes: number;
}

const STORAGE_KEYS = {
  SETTINGS: 'pomodoro-settings',
  STATS: 'pomodoro-stats',
  COMPLETED: 'pomodoro-completed',
} as const;

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 30,
};

const DEFAULT_STATS: PomodoroStats = {
  sessionCount: 0,
  isRunning: false,
  isFocusSession: true,
  timeLeft: 25 * 60, // Will be updated based on settings
  isPaused: false,
};

const DEFAULT_COMPLETED: CompletedStats = {
  completedPomodoros: 0,
  totalFocusMinutes: 0,
};

/**
 * Settings Storage
 */
export const saveSettings = (settings: PomodoroSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save pomodoro settings:', error);
  }
};

export const loadSettings = (): PomodoroSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(data);
    return {
      focusTime: parsed.focusTime ?? DEFAULT_SETTINGS.focusTime,
      shortBreakTime: parsed.shortBreakTime ?? DEFAULT_SETTINGS.shortBreakTime,
      longBreakTime: parsed.longBreakTime ?? DEFAULT_SETTINGS.longBreakTime,
    };
  } catch (error) {
    console.error('Failed to load pomodoro settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Stats Storage (timer state)
 */
export const saveStats = (stats: PomodoroStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save pomodoro stats:', error);
  }
};

export const loadStats = (focusTime: number): PomodoroStats => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) {
      return {
        ...DEFAULT_STATS,
        timeLeft: focusTime * 60,
      };
    }

    const parsed = JSON.parse(data);
    return {
      sessionCount: parsed.sessionCount ?? DEFAULT_STATS.sessionCount,
      isRunning: false, // Never restore running state
      isFocusSession: parsed.isFocusSession ?? DEFAULT_STATS.isFocusSession,
      timeLeft: parsed.timeLeft ?? focusTime * 60,
      isPaused: false, // Never restore paused state
    };
  } catch (error) {
    console.error('Failed to load pomodoro stats:', error);
    return {
      ...DEFAULT_STATS,
      timeLeft: focusTime * 60,
    };
  }
};

/**
 * Completed Stats Storage
 */
export const saveCompleted = (completed: CompletedStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completed));
  } catch (error) {
    console.error('Failed to save completed stats:', error);
  }
};

export const loadCompleted = (): CompletedStats => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    if (!data) return DEFAULT_COMPLETED;

    const parsed = JSON.parse(data);
    return {
      completedPomodoros: parsed.completedPomodoros ?? DEFAULT_COMPLETED.completedPomodoros,
      totalFocusMinutes: parsed.totalFocusMinutes ?? DEFAULT_COMPLETED.totalFocusMinutes,
    };
  } catch (error) {
    console.error('Failed to load completed stats:', error);
    return DEFAULT_COMPLETED;
  }
};

export const clearCompleted = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
  } catch (error) {
    console.error('Failed to clear completed stats:', error);
  }
};

/**
 * Clear all pomodoro data
 */
export const clearAllPomodoroData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
  } catch (error) {
    console.error('Failed to clear pomodoro data:', error);
  }
};
