// src/components/Tasks.tsx

'use client';

import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskItem from './TaskItem';

// Priority values mapping: position -> priority
const PRIORITY_VALUES = [1, 2, 3, 4, 6, 9];

export default function Tasks() {
  const {
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
    reorderSubtasks
  } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(2);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, selectedPriority);
      setNewTaskTitle('');
      setSelectedPriority(2); // Reset to default
    }
  };

  // Get slider position (0-100) from priority value
  const getSliderPosition = (priority: number): number => {
    const index = PRIORITY_VALUES.indexOf(priority);
    return (index / (PRIORITY_VALUES.length - 1)) * 100;
  };

  // Get priority value from slider position (0-100)
  const getPriorityFromPosition = (position: number): number => {
    const index = Math.round((position / 100) * (PRIORITY_VALUES.length - 1));
    return PRIORITY_VALUES[Math.max(0, Math.min(index, PRIORITY_VALUES.length - 1))];
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseInt(e.target.value);
    const priority = getPriorityFromPosition(position);
    setSelectedPriority(priority);
  };

  // Task drag handlers
  const handleTaskDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTaskIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

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
        <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
        <p className="text-sm text-gray-500 mt-1">
          Organize your work with tasks and subtasks
        </p>
      </div>

      {/* Add Task Form */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <form onSubmit={handleAddTask} className="space-y-3">
          {/* Input and Button Row */}
          <div className="flex gap-2">
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

          {/* Priority Slider */}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="text-gray-700 font-medium">Priority: {selectedPriority}</span>
            </div>
            <div className="relative">
              <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-lime-400 to-green-500 rounded-full"></div>
              <input
                type="range"
                min="0"
                max="100"
                value={getSliderPosition(selectedPriority)}
                onChange={handleSliderChange}
                className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md border-2 border-black flex items-center justify-center text-xs font-bold text-black pointer-events-none"
                style={{ left: `calc(${getSliderPosition(selectedPriority)}% - 12px)` }}
              >
                {selectedPriority}
              </div>
            </div>
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
    </div>
  );
}
