// src/types/task.ts

export interface Subtask {
  id: string;                    // UUID
  title: string;
  completed: boolean;
  createdAt: number;             // timestamp
  order: number;                 // for drag-and-drop ordering
}

export interface Task {
  id: string;                    // UUID
  title: string;
  completed: boolean;
  expanded: boolean;             // UI state for expand/collapse
  subtasks: Subtask[];
  createdAt: number;             // timestamp
  order: number;                 // for drag-and-drop ordering
}

export interface TaskState {
  tasks: Task[];
  lastModified: number;          // for sync tracking
}
