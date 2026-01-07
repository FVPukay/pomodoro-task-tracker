// src/components/TaskItem.tsx

'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import SubtaskItem from './SubtaskItem';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggleComplete: (taskId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdateTitle: (taskId: string, title: string) => void;
  onUpdatePriority: (taskId: string, priority: number) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onUpdateSubtaskTitle: (taskId: string, subtaskId: string, title: string) => void;
  onReorderSubtasks: (taskId: string, sourceIndex: number, destIndex: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

// Priority values mapping: position -> priority
const PRIORITY_VALUES = [1, 2, 3, 4, 6, 9];

export default function TaskItem({
  task,
  index,
  onToggleComplete,
  onToggleExpanded,
  onDelete,
  onUpdateTitle,
  onUpdatePriority,
  onAddSubtask,
  onDeleteSubtask,
  onToggleSubtaskComplete,
  onUpdateSubtaskTitle,
  onReorderSubtasks,
  onDragStart,
  onDragOver,
  onDrop
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [draggedSubtaskIndex, setDraggedSubtaskIndex] = useState<number | null>(null);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTitle(task.id, editTitle);
      setIsEditing(false);
    } else {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

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

  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseInt(e.target.value);
    const priority = getPriorityFromPosition(position);
    onUpdatePriority(task.id, priority);
  };

  // Get priority badge color based on priority value
  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 9:
        return 'bg-green-700'; // dark green
      case 6:
        return 'bg-green-400'; // light green
      case 4:
      case 3:
        return 'bg-yellow-400'; // yellow
      case 2:
        return 'bg-orange-500'; // orange
      case 1:
        return 'bg-red-500'; // red
      default:
        return 'bg-gray-500'; // fallback
    }
  };

  // Subtask drag handlers
  const handleSubtaskDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedSubtaskIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSubtaskDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSubtaskDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedSubtaskIndex !== null && draggedSubtaskIndex !== dropIndex) {
      onReorderSubtasks(task.id, draggedSubtaskIndex, dropIndex);
    }
    setDraggedSubtaskIndex(null);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 group">
          {/* Drag Handle */}
          <div className="cursor-move text-gray-400 hover:text-gray-600 mt-1">
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <circle cx="5" cy="4" r="1" />
              <circle cx="5" cy="8" r="1" />
              <circle cx="5" cy="12" r="1" />
              <circle cx="11" cy="4" r="1" />
              <circle cx="11" cy="8" r="1" />
              <circle cx="11" cy="12" r="1" />
            </svg>
          </div>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            className="w-5 h-5 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-gray-900 text-base font-medium border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-500"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3
                  onDoubleClick={() => setIsEditing(true)}
                  className={`text-base font-medium cursor-text ${
                    task.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-800'
                  }`}
                  title="Double-click to edit"
                >
                  {task.title}
                </h3>
                {totalSubtasks > 0 && (
                  <span className="text-xs text-gray-500">
                    ({completedSubtasks}/{totalSubtasks})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Priority Badge */}
            <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>

            {/* Expand/Collapse Button - Always visible */}
            <button
              onClick={() => onToggleExpanded(task.id)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={task.expanded ? 'Collapse' : 'Expand'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                className={`transform transition-transform ${
                  task.expanded ? 'rotate-180' : ''
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
              aria-label="Delete task"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Subtasks Section */}
        {task.expanded && (
          <div className="mt-4 ml-8 space-y-2">
            {/* Priority Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-700 font-medium">Priority: {task.priority}</span>
              </div>
              <div className="relative">
                <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-lime-400 to-green-500 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={getSliderPosition(task.priority)}
                  onChange={handlePriorityChange}
                  className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md border-2 border-black flex items-center justify-center text-xs font-bold text-black pointer-events-none"
                  style={{ left: `calc(${getSliderPosition(task.priority)}% - 12px)` }}
                >
                  {task.priority}
                </div>
              </div>
            </div>

            {/* Subtasks List */}
            {task.subtasks.map((subtask, idx) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                taskId={task.id}
                index={idx}
                onToggleComplete={onToggleSubtaskComplete}
                onDelete={onDeleteSubtask}
                onUpdateTitle={onUpdateSubtaskTitle}
                onDragStart={handleSubtaskDragStart}
                onDragOver={handleSubtaskDragOver}
                onDrop={handleSubtaskDrop}
              />
            ))}

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 px-3 py-2 text-gray-900 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
