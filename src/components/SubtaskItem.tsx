// src/components/SubtaskItem.tsx

'use client';

import React, { useState } from 'react';
import { Subtask } from '@/types/task';

interface SubtaskItemProps {
  subtask: Subtask;
  taskId: string;
  index: number;
  onToggleComplete: (taskId: string, subtaskId: string) => void;
  onDelete: (taskId: string, subtaskId: string) => void;
  onUpdateTitle: (taskId: string, subtaskId: string, title: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export default function SubtaskItem({
  subtask,
  taskId,
  index,
  onToggleComplete,
  onDelete,
  onUpdateTitle,
  onDragStart,
  onDragOver,
  onDrop
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdateTitle(taskId, subtask.id, editTitle);
      setIsEditing(false);
    } else {
      setEditTitle(subtask.title);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(subtask.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors group"
    >
      {/* Drag Handle */}
      <div className="cursor-move text-gray-400 hover:text-gray-600">
        <svg
          width="16"
          height="16"
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
        checked={subtask.completed}
        onChange={() => onToggleComplete(taskId, subtask.id)}
        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
      />

      {/* Title */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-gray-900 text-sm border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-500"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={`flex-1 text-sm ${
            subtask.completed
              ? 'line-through text-gray-400'
              : 'text-gray-700'
          } cursor-text`}
          title="Double-click to edit"
        >
          {subtask.title}
        </span>
      )}

      {/* Delete Button */}
      <button
        onClick={() => onDelete(taskId, subtask.id)}
        className="text-red-500 hover:text-red-700 transition-colors"
        aria-label="Delete subtask"
      >
        <svg
          width="16"
          height="16"
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
  );
}
