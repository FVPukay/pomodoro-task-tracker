// src/lib/storage/__tests__/localStorage.test.ts

import { LocalStorageAdapter } from '../localStorage';
import { Task } from '@/types/task';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('save', () => {
    it('should save tasks to localStorage', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      adapter.save(tasks);

      const savedData = localStorage.getItem('pomodoro-tasks');
      expect(savedData).not.toBeNull();

      const parsed = JSON.parse(savedData!);
      expect(parsed.tasks).toEqual(tasks);
      expect(parsed.lastModified).toBeGreaterThan(0);
    });

    it('should save empty array to localStorage', () => {
      adapter.save([]);

      const savedData = localStorage.getItem('pomodoro-tasks');
      expect(savedData).not.toBeNull();

      const parsed = JSON.parse(savedData!);
      expect(parsed.tasks).toEqual([]);
    });

    it('should update lastModified timestamp on each save', async () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      adapter.save(tasks);
      const firstTimestamp = adapter.getLastModified();

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      adapter.save(tasks);
      const secondTimestamp = adapter.getLastModified();

      expect(secondTimestamp).toBeGreaterThan(firstTimestamp!);
    });

    it('should throw error when localStorage quota is exceeded', () => {
      // Mock setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      expect(() => adapter.save(tasks)).toThrow('Failed to save tasks: Storage quota exceeded');

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('load', () => {
    it('should load tasks from localStorage', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      adapter.save(tasks);
      const loadedTasks = adapter.load();

      expect(loadedTasks).toEqual(tasks);
    });

    it('should return empty array when no data exists', () => {
      const loadedTasks = adapter.load();
      expect(loadedTasks).toEqual([]);
    });

    it('should return empty array when localStorage data is corrupted', () => {
      localStorage.setItem('pomodoro-tasks', 'invalid json');

      const loadedTasks = adapter.load();
      expect(loadedTasks).toEqual([]);
    });

    it('should handle missing tasks property in stored data', () => {
      localStorage.setItem('pomodoro-tasks', JSON.stringify({ lastModified: Date.now() }));

      const loadedTasks = adapter.load();
      expect(loadedTasks).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove tasks from localStorage', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      adapter.save(tasks);
      expect(localStorage.getItem('pomodoro-tasks')).not.toBeNull();

      adapter.clear();
      expect(localStorage.getItem('pomodoro-tasks')).toBeNull();
    });

    it('should not throw error when clearing empty storage', () => {
      expect(() => adapter.clear()).not.toThrow();
    });
  });

  describe('getLastModified', () => {
    it('should return last modified timestamp', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      const beforeSave = Date.now();
      adapter.save(tasks);
      const afterSave = Date.now();

      const lastModified = adapter.getLastModified();
      expect(lastModified).toBeGreaterThanOrEqual(beforeSave);
      expect(lastModified).toBeLessThanOrEqual(afterSave);
    });

    it('should return null when no data exists', () => {
      const lastModified = adapter.getLastModified();
      expect(lastModified).toBeNull();
    });

    it('should return null when data is corrupted', () => {
      localStorage.setItem('pomodoro-tasks', 'invalid json');

      const lastModified = adapter.getLastModified();
      expect(lastModified).toBeNull();
    });
  });

  describe('integration', () => {
    it('should handle save and load cycle correctly', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          completed: false,
          expanded: false,
          subtasks: [
            {
              id: '1-1',
              title: 'Subtask 1',
              completed: false,
              createdAt: Date.now(),
              order: 0
            }
          ],
          createdAt: Date.now(),
          order: 0,
          priority: 9
        },
        {
          id: '2',
          title: 'Task 2',
          completed: true,
          expanded: true,
          subtasks: [],
          createdAt: Date.now(),
          order: 1,
          priority: 2
        }
      ];

      // Save tasks
      adapter.save(tasks);

      // Load tasks
      const loadedTasks = adapter.load();

      // Verify loaded tasks match original
      expect(loadedTasks).toEqual(tasks);
      expect(loadedTasks.length).toBe(2);
      expect(loadedTasks[0].subtasks.length).toBe(1);
    });

    it('should handle save and load with priority field', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'High priority task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0,
          priority: 9
        },
        {
          id: '2',
          title: 'Medium priority task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 1,
          priority: 2
        },
        {
          id: '3',
          title: 'Low priority task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 2,
          priority: 1
        }
      ];

      // Save tasks with priority
      adapter.save(tasks);

      // Load tasks
      const loadedTasks = adapter.load();

      // Verify priorities are preserved
      expect(loadedTasks).toEqual(tasks);
      expect(loadedTasks[0].priority).toBe(9);
      expect(loadedTasks[1].priority).toBe(2);
      expect(loadedTasks[2].priority).toBe(1);
    });

    it('should handle clear and load cycle correctly', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      // Save tasks
      adapter.save(tasks);
      expect(adapter.load()).toEqual(tasks);

      // Clear tasks
      adapter.clear();
      expect(adapter.load()).toEqual([]);
    });
  });
});
