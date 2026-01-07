// src/hooks/__tests__/useTasks.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../useTasks';

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty tasks array', () => {
      const { result } = renderHook(() => useTasks());
      expect(result.current.tasks).toEqual([]);
    });

    it('should load tasks from localStorage on mount', () => {
      const existingTasks = [
        {
          id: '1',
          title: 'Existing Task',
          completed: false,
          expanded: false,
          subtasks: [],
          createdAt: Date.now(),
          order: 0
        }
      ];

      localStorage.setItem('pomodoro-tasks', JSON.stringify({
        tasks: existingTasks,
        lastModified: Date.now()
      }));

      const { result } = renderHook(() => useTasks());
      expect(result.current.tasks).toEqual(existingTasks);
    });
  });

  describe('addTask', () => {
    it('should add a new task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('New Task');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('New Task');
      expect(result.current.tasks[0].completed).toBe(false);
      expect(result.current.tasks[0].expanded).toBe(false);
      expect(result.current.tasks[0].subtasks).toEqual([]);
    });

    it('should not add task with empty title', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('');
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('should trim whitespace from task title', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('  Task with spaces  ');
      });

      expect(result.current.tasks[0].title).toBe('Task with spaces');
    });

    it('should assign correct order to tasks', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
        result.current.addTask('Task 2');
        result.current.addTask('Task 3');
      });

      expect(result.current.tasks[0].order).toBe(0);
      expect(result.current.tasks[1].order).toBe(1);
      expect(result.current.tasks[2].order).toBe(2);
    });

    it('should save to localStorage after adding task', async () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('New Task');
      });

      await waitFor(() => {
        const saved = localStorage.getItem('pomodoro-tasks');
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.tasks).toHaveLength(1);
      });
    });

    it('should create task with specified priority', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('High priority task', 9);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].priority).toBe(9);
    });

    it('should create task with medium priority when not specified', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Default priority task');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].priority).toBe(2);
    });

    it('should create tasks with different priorities', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('High Impact Low Time', 9);
        result.current.addTask('High Impact Medium Time', 6);
        result.current.addTask('High Impact High Time', 4);
        result.current.addTask('Medium Impact Low Time', 3);
        result.current.addTask('Medium Impact Medium Time', 2);
        result.current.addTask('Low Impact Low Time', 1);
      });

      expect(result.current.tasks).toHaveLength(6);
      expect(result.current.tasks[0].priority).toBe(9);
      expect(result.current.tasks[1].priority).toBe(6);
      expect(result.current.tasks[2].priority).toBe(4);
      expect(result.current.tasks[3].priority).toBe(3);
      expect(result.current.tasks[4].priority).toBe(2);
      expect(result.current.tasks[5].priority).toBe(1);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task by id', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
        result.current.addTask('Task 2');
      });

      const taskIdToDelete = result.current.tasks[0].id;

      act(() => {
        result.current.deleteTask(taskIdToDelete);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Task 2');
    });

    it('should not throw error when deleting non-existent task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      expect(() => {
        act(() => {
          result.current.deleteTask('non-existent-id');
        });
      }).not.toThrow();

      expect(result.current.tasks).toHaveLength(1);
    });
  });

  describe('updateTaskTitle', () => {
    it('should update task title', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Original Title');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.updateTaskTitle(taskId, 'Updated Title');
      });

      expect(result.current.tasks[0].title).toBe('Updated Title');
    });

    it('should not update title to empty string', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Original Title');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.updateTaskTitle(taskId, '');
      });

      expect(result.current.tasks[0].title).toBe('Original Title');
    });

    it('should trim whitespace from updated title', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Original Title');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.updateTaskTitle(taskId, '  Updated Title  ');
      });

      expect(result.current.tasks[0].title).toBe('Updated Title');
    });
  });

  describe('updateTaskPriority', () => {
    it('should update task priority', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Test Task', 2);
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.updateTaskPriority(taskId, 9);
      });

      expect(result.current.tasks[0].priority).toBe(9);
    });

    it('should update priority for correct task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1', 2);
        result.current.addTask('Task 2', 3);
        result.current.addTask('Task 3', 4);
      });

      const task2Id = result.current.tasks[1].id;

      act(() => {
        result.current.updateTaskPriority(task2Id, 9);
      });

      expect(result.current.tasks[0].priority).toBe(2);
      expect(result.current.tasks[1].priority).toBe(9);
      expect(result.current.tasks[2].priority).toBe(4);
    });

    it('should handle all valid priority values', () => {
      const { result } = renderHook(() => useTasks());
      const priorities = [1, 2, 3, 4, 6, 9];

      act(() => {
        result.current.addTask('Test Task', 2);
      });

      const taskId = result.current.tasks[0].id;

      priorities.forEach(priority => {
        act(() => {
          result.current.updateTaskPriority(taskId, priority);
        });

        expect(result.current.tasks[0].priority).toBe(priority);
      });
    });

    it('should not throw error when updating non-existent task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1', 2);
      });

      expect(() => {
        act(() => {
          result.current.updateTaskPriority('non-existent-id', 9);
        });
      }).not.toThrow();

      expect(result.current.tasks[0].priority).toBe(2);
    });
  });

  describe('toggleTaskComplete', () => {
    it('should toggle task completed state', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);

      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(false);
    });

    it('should mark all subtasks complete when parent task is marked complete', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      // Add some subtasks
      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
        result.current.addSubtask(taskId, 'Subtask 3');
      });

      // All subtasks should start uncompleted
      expect(result.current.tasks[0].subtasks[0].completed).toBe(false);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(false);
      expect(result.current.tasks[0].subtasks[2].completed).toBe(false);

      // Mark parent task complete
      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      // Parent should be completed
      expect(result.current.tasks[0].completed).toBe(true);

      // All subtasks should now be completed
      expect(result.current.tasks[0].subtasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[2].completed).toBe(true);
    });

    it('should mark all subtasks incomplete when parent task is marked incomplete', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      // Add and complete some subtasks
      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
      });

      const subtask1Id = result.current.tasks[0].subtasks[0].id;
      const subtask2Id = result.current.tasks[0].subtasks[1].id;

      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
        result.current.toggleSubtaskComplete(taskId, subtask2Id);
      });

      // Task and all subtasks should be completed
      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(true);

      // Mark parent task incomplete
      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      // Parent should be incomplete
      expect(result.current.tasks[0].completed).toBe(false);

      // All subtasks should now be incomplete
      expect(result.current.tasks[0].subtasks[0].completed).toBe(false);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(false);
    });

    it('should handle task with mixed subtask states correctly', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      // Add subtasks and complete only some
      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
        result.current.addSubtask(taskId, 'Subtask 3');
      });

      const subtask1Id = result.current.tasks[0].subtasks[0].id;

      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
      });

      // Only first subtask is completed
      expect(result.current.tasks[0].subtasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(false);
      expect(result.current.tasks[0].subtasks[2].completed).toBe(false);

      // Mark parent complete - all subtasks should become complete
      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[2].completed).toBe(true);
    });

    it('should work correctly when parent completed and subtask manually unchecked', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
      });

      // Mark parent complete (all subtasks become complete)
      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(true);

      // Manually uncheck one subtask
      const subtask1Id = result.current.tasks[0].subtasks[0].id;
      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
      });

      // Parent should auto-uncomplete since not all subtasks are complete
      expect(result.current.tasks[0].completed).toBe(false);
      expect(result.current.tasks[0].subtasks[0].completed).toBe(false);
      expect(result.current.tasks[0].subtasks[1].completed).toBe(true);
    });

    it('should toggle normally for task with no subtasks', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task without subtasks');
      });

      const taskId = result.current.tasks[0].id;

      // Should work normally even with no subtasks
      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.tasks[0].subtasks).toHaveLength(0);

      act(() => {
        result.current.toggleTaskComplete(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(false);
    });
  });

  describe('toggleTaskExpanded', () => {
    it('should toggle task expanded state', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.toggleTaskExpanded(taskId);
      });

      expect(result.current.tasks[0].expanded).toBe(true);

      act(() => {
        result.current.toggleTaskExpanded(taskId);
      });

      expect(result.current.tasks[0].expanded).toBe(false);
    });
  });

  describe('reorderTasks', () => {
    it('should reorder tasks correctly', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
        result.current.addTask('Task 2');
        result.current.addTask('Task 3');
      });

      act(() => {
        result.current.reorderTasks(0, 2); // Move first task to last position
      });

      expect(result.current.tasks[0].title).toBe('Task 2');
      expect(result.current.tasks[1].title).toBe('Task 3');
      expect(result.current.tasks[2].title).toBe('Task 1');

      // Check order property is updated
      expect(result.current.tasks[0].order).toBe(0);
      expect(result.current.tasks[1].order).toBe(1);
      expect(result.current.tasks[2].order).toBe(2);
    });

    it('should handle reordering to same position', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
        result.current.addTask('Task 2');
      });

      const originalTasks = [...result.current.tasks];

      act(() => {
        result.current.reorderTasks(0, 0);
      });

      expect(result.current.tasks[0].title).toBe(originalTasks[0].title);
      expect(result.current.tasks[1].title).toBe(originalTasks[1].title);
    });
  });

  describe('addSubtask', () => {
    it('should add a subtask to a task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
      });

      expect(result.current.tasks[0].subtasks).toHaveLength(1);
      expect(result.current.tasks[0].subtasks[0].title).toBe('Subtask 1');
      expect(result.current.tasks[0].subtasks[0].completed).toBe(false);
    });

    it('should not add subtask with empty title', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, '');
      });

      expect(result.current.tasks[0].subtasks).toHaveLength(0);
    });

    it('should assign correct order to subtasks', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
        result.current.addSubtask(taskId, 'Subtask 3');
      });

      expect(result.current.tasks[0].subtasks[0].order).toBe(0);
      expect(result.current.tasks[0].subtasks[1].order).toBe(1);
      expect(result.current.tasks[0].subtasks[2].order).toBe(2);
    });
  });

  describe('deleteSubtask', () => {
    it('should delete a subtask from a task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
      });

      const subtaskIdToDelete = result.current.tasks[0].subtasks[0].id;

      act(() => {
        result.current.deleteSubtask(taskId, subtaskIdToDelete);
      });

      expect(result.current.tasks[0].subtasks).toHaveLength(1);
      expect(result.current.tasks[0].subtasks[0].title).toBe('Subtask 2');
    });
  });

  describe('updateSubtaskTitle', () => {
    it('should update subtask title', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Original Subtask');
      });

      const subtaskId = result.current.tasks[0].subtasks[0].id;

      act(() => {
        result.current.updateSubtaskTitle(taskId, subtaskId, 'Updated Subtask');
      });

      expect(result.current.tasks[0].subtasks[0].title).toBe('Updated Subtask');
    });

    it('should not update subtask title to empty string', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Original Subtask');
      });

      const subtaskId = result.current.tasks[0].subtasks[0].id;

      act(() => {
        result.current.updateSubtaskTitle(taskId, subtaskId, '');
      });

      expect(result.current.tasks[0].subtasks[0].title).toBe('Original Subtask');
    });
  });

  describe('toggleSubtaskComplete', () => {
    it('should toggle subtask completed state', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
      });

      const subtaskId = result.current.tasks[0].subtasks[0].id;

      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtaskId);
      });

      expect(result.current.tasks[0].subtasks[0].completed).toBe(true);

      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtaskId);
      });

      expect(result.current.tasks[0].subtasks[0].completed).toBe(false);
    });
  });

  describe('reorderSubtasks', () => {
    it('should reorder subtasks correctly', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
        result.current.addSubtask(taskId, 'Subtask 3');
      });

      act(() => {
        result.current.reorderSubtasks(taskId, 0, 2); // Move first subtask to last position
      });

      expect(result.current.tasks[0].subtasks[0].title).toBe('Subtask 2');
      expect(result.current.tasks[0].subtasks[1].title).toBe('Subtask 3');
      expect(result.current.tasks[0].subtasks[2].title).toBe('Subtask 1');

      // Check order property is updated
      expect(result.current.tasks[0].subtasks[0].order).toBe(0);
      expect(result.current.tasks[0].subtasks[1].order).toBe(1);
      expect(result.current.tasks[0].subtasks[2].order).toBe(2);
    });
  });

  describe('clearAllTasks', () => {
    it('should clear all tasks', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
        result.current.addTask('Task 2');
      });

      expect(result.current.tasks).toHaveLength(2);

      act(() => {
        result.current.clearAllTasks();
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('should clear localStorage', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      act(() => {
        result.current.clearAllTasks();
      });

      expect(localStorage.getItem('pomodoro-tasks')).toBeNull();
    });
  });

  describe('auto-complete logic', () => {
    it('should auto-complete task when all subtasks are completed', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
      });

      // Task should not be completed yet
      expect(result.current.tasks[0].completed).toBe(false);

      // Complete first subtask
      const subtask1Id = result.current.tasks[0].subtasks[0].id;
      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
      });

      // Task still not completed
      expect(result.current.tasks[0].completed).toBe(false);

      // Complete second subtask
      const subtask2Id = result.current.tasks[0].subtasks[1].id;
      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask2Id);
      });

      // Task should now be auto-completed
      expect(result.current.tasks[0].completed).toBe(true);
    });

    it('should uncomplete task when a subtask is uncompleted', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
      });

      // Complete both subtasks
      const subtask1Id = result.current.tasks[0].subtasks[0].id;
      const subtask2Id = result.current.tasks[0].subtasks[1].id;

      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
        result.current.toggleSubtaskComplete(taskId, subtask2Id);
      });

      // Task should be completed
      expect(result.current.tasks[0].completed).toBe(true);

      // Uncomplete first subtask
      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
      });

      // Task should now be uncompleted
      expect(result.current.tasks[0].completed).toBe(false);
    });

    it('should uncomplete task when adding a new subtask to a completed task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
      });

      // Complete the subtask (which auto-completes the task)
      const subtask1Id = result.current.tasks[0].subtasks[0].id;
      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
      });

      // Task should be completed
      expect(result.current.tasks[0].completed).toBe(true);

      // Add a new subtask
      act(() => {
        result.current.addSubtask(taskId, 'Subtask 2');
      });

      // Task should now be uncompleted
      expect(result.current.tasks[0].completed).toBe(false);
    });

    it('should maintain completion state when deleting an uncompleted subtask from a completed task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.addSubtask(taskId, 'Subtask 1');
        result.current.addSubtask(taskId, 'Subtask 2');
      });

      // Complete first subtask only
      const subtask1Id = result.current.tasks[0].subtasks[0].id;
      act(() => {
        result.current.toggleSubtaskComplete(taskId, subtask1Id);
      });

      // Task not completed (only 1 of 2 complete)
      expect(result.current.tasks[0].completed).toBe(false);

      // Delete the uncompleted subtask
      const subtask2Id = result.current.tasks[0].subtasks[1].id;
      act(() => {
        result.current.deleteSubtask(taskId, subtask2Id);
      });

      // Task should now be completed (all remaining subtasks are complete)
      expect(result.current.tasks[0].completed).toBe(true);
    });

    it('should not mark task as completed when no subtasks exist', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      // Task should not be auto-completed even though technically "all 0 subtasks are complete"
      expect(result.current.tasks[0].completed).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist tasks to localStorage', async () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      await waitFor(() => {
        const saved = localStorage.getItem('pomodoro-tasks');
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.tasks).toHaveLength(1);
        expect(parsed.tasks[0].title).toBe('Task 1');
      });
    });

    it('should load persisted tasks on new hook instance', () => {
      // First hook instance
      const { result: result1 } = renderHook(() => useTasks());

      act(() => {
        result1.current.addTask('Persisted Task');
      });

      // Second hook instance (simulating page reload)
      const { result: result2 } = renderHook(() => useTasks());

      expect(result2.current.tasks).toHaveLength(1);
      expect(result2.current.tasks[0].title).toBe('Persisted Task');
    });
  });
});
