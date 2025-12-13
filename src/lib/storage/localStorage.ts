// src/lib/storage/localStorage.ts

import { Task, TaskState } from '@/types/task';

export class LocalStorageAdapter {
  private key = 'pomodoro-tasks';

  /**
   * Save tasks to localStorage
   * @param tasks - Array of tasks to save
   */
  save(tasks: Task[]): void {
    try {
      const data: TaskState = {
        tasks,
        lastModified: Date.now()
      };
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      // Handle quota exceeded error
      console.error('localStorage quota exceeded', error);
      throw new Error('Failed to save tasks: Storage quota exceeded');
    }
  }

  /**
   * Load tasks from localStorage
   * @returns Array of tasks, or empty array if none exist
   */
  load(): Task[] {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return [];

      const parsed: TaskState = JSON.parse(data);
      return parsed.tasks || [];
    } catch (error) {
      console.error('Failed to load tasks', error);
      return [];
    }
  }

  /**
   * Clear all tasks from localStorage
   */
  clear(): void {
    localStorage.removeItem(this.key);
  }

  /**
   * Get the last modified timestamp
   * @returns timestamp or null if no data exists
   */
  getLastModified(): number | null {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return null;

      const parsed: TaskState = JSON.parse(data);
      return parsed.lastModified;
    } catch (error) {
      console.error('Failed to get last modified timestamp', error);
      return null;
    }
  }
}
