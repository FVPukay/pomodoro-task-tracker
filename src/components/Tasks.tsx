// src/components/Tasks.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskItem from './TaskItem';
import PriorityMatrix from './PriorityMatrix';

export default function Tasks() {
  const {
    tasks,
    addTask,
    deleteTask,
    updateTaskTitle,
    updateTaskPriority,
    toggleTaskComplete,
    toggleTaskExpanded,
    reorderTasks,
    addSubtask,
    deleteSubtask,
    updateSubtaskTitle,
    toggleSubtaskComplete,
    reorderSubtasks
  } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);
  const [showPriorityMatrixDialog, setShowPriorityMatrixDialog] = useState(false);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPriorityMatrixDialog) {
        setShowPriorityMatrixDialog(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPriorityMatrixDialog]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, 4); // Default priority of 4
      setNewTaskTitle('');
    }
  };

  // Task drag handlers
  const handleTaskDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTaskIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTaskDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedTaskIndex !== null && draggedTaskIndex !== dropIndex) {
      reorderTasks(draggedTaskIndex, dropIndex);
    }
    setDraggedTaskIndex(null);
  };

  return (
    <div className="w-full h-full max-h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Tasks and Subtasks</h2>
          <button
            onClick={() => setShowPriorityMatrixDialog(true)}
            className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            aria-label="Open Priority Matrix"
          >
            Priority Matrix
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <form onSubmit={handleAddTask}>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-2 font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="mb-4"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <p className="text-lg font-medium">No tasks yet</p>
            <p className="text-sm mt-1">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                onToggleComplete={toggleTaskComplete}
                onToggleExpanded={toggleTaskExpanded}
                onDelete={deleteTask}
                onUpdateTitle={updateTaskTitle}
                onUpdatePriority={updateTaskPriority}
                onAddSubtask={addSubtask}
                onDeleteSubtask={deleteSubtask}
                onToggleSubtaskComplete={toggleSubtaskComplete}
                onUpdateSubtaskTitle={updateSubtaskTitle}
                onReorderSubtasks={reorderSubtasks}
                onDragStart={handleTaskDragStart}
                onDragOver={handleTaskDragOver}
                onDrop={handleTaskDrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {tasks.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </span>
            <span>
              {tasks.reduce((acc, t) => acc + t.subtasks.length, 0)} subtasks total
            </span>
          </div>
        </div>
      )}

      {/* Priority Matrix Dialog */}
      {showPriorityMatrixDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
          onClick={() => setShowPriorityMatrixDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="priority-matrix-dialog-title"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPriorityMatrixDialog(false)}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
              aria-label="Close Priority Matrix dialog"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <PriorityMatrix />
          </div>
        </div>
      )}
    </div>
  );
}
