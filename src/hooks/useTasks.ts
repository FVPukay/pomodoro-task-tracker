// src/hooks/useTasks.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Subtask } from '@/types/task';
import { LocalStorageAdapter } from '@/lib/storage/localStorage';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [storage] = useState(() => new LocalStorageAdapter());

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadedTasks = storage.load();
    setTasks(loadedTasks);
  }, [storage]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0 || storage.load().length > 0) {
      storage.save(tasks);
    }
  }, [tasks, storage]);

  // ========== TASK OPERATIONS ==========

  /**
   * Add a new task
   */
  const addTask = useCallback((title: string, priority: number = 2) => {
    if (!title.trim()) return;

    setTasks(prev => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        expanded: false,
        subtasks: [],
        createdAt: Date.now(),
        order: prev.length,
        priority
      };

      return [...prev, newTask];
    });
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  /**
   * Update a task's title
   */
  const updateTaskTitle = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, title: title.trim() } : task
      )
    );
  }, []);

  /**
   * Toggle a task's completed state
   * Also marks all subtasks with the same completion status as the parent
   */
  const toggleTaskComplete = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newCompletedStatus = !task.completed;

          // Mark all subtasks with the same completion status
          const updatedSubtasks = task.subtasks.map(subtask => ({
            ...subtask,
            completed: newCompletedStatus
          }));

          return {
            ...task,
            completed: newCompletedStatus,
            subtasks: updatedSubtasks
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Toggle a task's expanded state
   */
  const toggleTaskExpanded = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    );
  }, []);

  /**
   * Reorder tasks via drag and drop
   */
  const reorderTasks = useCallback((sourceIndex: number, destIndex: number) => {
    setTasks(prev => {
      const newTasks = [...prev];
      const [movedTask] = newTasks.splice(sourceIndex, 1);
      newTasks.splice(destIndex, 0, movedTask);

      // Update order property
      return newTasks.map((task, index) => ({
        ...task,
        order: index
      }));
    });
  }, []);

  // ========== SUBTASK OPERATIONS ==========

  /**
   * Add a subtask to a task
   * If task is completed, mark it as incomplete when adding a new uncompleted subtask
   */
  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newSubtask: Subtask = {
            id: crypto.randomUUID(),
            title: title.trim(),
            completed: false,
            createdAt: Date.now(),
            order: task.subtasks.length
          };

          return {
            ...task,
            completed: false, // Unmark task as completed when adding new subtask
            subtasks: [...task.subtasks, newSubtask]
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Delete a subtask from a task
   * Auto-complete task if all remaining subtasks are completed
   */
  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);

          // Check if all remaining subtasks are completed
          const allSubtasksCompleted = updatedSubtasks.length > 0 &&
            updatedSubtasks.every(subtask => subtask.completed);

          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: allSubtasksCompleted
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Update a subtask's title
   */
  const updateSubtaskTitle = useCallback((taskId: string, subtaskId: string, title: string) => {
    if (!title.trim()) return;

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, title: title.trim() }
                : subtask
            )
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Toggle a subtask's completed state
   * Auto-complete task if all subtasks are completed
   * Auto-uncomplete task if any subtask is uncompleted
   */
  const toggleSubtaskComplete = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          // Update the subtask completion status
          const updatedSubtasks = task.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );

          // Check if all subtasks are now completed
          const allSubtasksCompleted = updatedSubtasks.length > 0 &&
            updatedSubtasks.every(subtask => subtask.completed);

          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: allSubtasksCompleted
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Reorder subtasks within a task via drag and drop
   */
  const reorderSubtasks = useCallback((taskId: string, sourceIndex: number, destIndex: number) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newSubtasks = [...task.subtasks];
          const [movedSubtask] = newSubtasks.splice(sourceIndex, 1);
          newSubtasks.splice(destIndex, 0, movedSubtask);

          // Update order property
          return {
            ...task,
            subtasks: newSubtasks.map((subtask, index) => ({
              ...subtask,
              order: index
            }))
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Clear all tasks
   */
  const clearAllTasks = useCallback(() => {
    setTasks([]);
    storage.clear();
  }, [storage]);

  return {
    tasks,
    addTask,
    deleteTask,
    updateTaskTitle,
    toggleTaskComplete,
    toggleTaskExpanded,
    reorderTasks,
    addSubtask,
    deleteSubtask,
    updateSubtaskTitle,
    toggleSubtaskComplete,
    reorderSubtasks,
    clearAllTasks
  };
}
