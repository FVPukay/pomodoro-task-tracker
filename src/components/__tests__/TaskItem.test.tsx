// src/components/__tests__/TaskItem.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskItem from '../TaskItem';
import { Task } from '@/types/task';

describe('TaskItem Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    completed: false,
    expanded: false,
    subtasks: [],
    createdAt: Date.now(),
    order: 0,
    priority: 9
  };

  const defaultProps = {
    task: mockTask,
    index: 0,
    onToggleComplete: jest.fn(),
    onToggleExpanded: jest.fn(),
    onDelete: jest.fn(),
    onUpdateTitle: jest.fn(),
    onAddSubtask: jest.fn(),
    onDeleteSubtask: jest.fn(),
    onToggleSubtaskComplete: jest.fn(),
    onUpdateSubtaskTitle: jest.fn(),
    onReorderSubtasks: jest.fn(),
    onDragStart: jest.fn(),
    onDragOver: jest.fn(),
    onDrop: jest.fn()
  };

  describe('Priority Badge', () => {
    it('should display priority badge with correct number', () => {
      render(<TaskItem {...defaultProps} />);

      const badge = screen.getByText('9');
      expect(badge).toBeInTheDocument();
    });

    it('should display different priority values', () => {
      const { rerender } = render(<TaskItem {...defaultProps} />);
      expect(screen.getByText('9')).toBeInTheDocument();

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 6 }} />);
      expect(screen.getByText('6')).toBeInTheDocument();

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 4 }} />);
      expect(screen.getByText('4')).toBeInTheDocument();

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 3 }} />);
      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 2 }} />);
      expect(screen.getByText('2')).toBeInTheDocument();

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 1 }} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should have correct color styling based on priority', () => {
      const { container, rerender } = render(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 9 }} />);

      // Priority 9 should be dark green
      let badge = container.querySelector('.bg-green-700');
      expect(badge).toBeInTheDocument();

      // Priority 6 should be light green
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 6 }} />);
      badge = container.querySelector('.bg-green-400');
      expect(badge).toBeInTheDocument();

      // Priority 4 should be yellow
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 4 }} />);
      badge = container.querySelector('.bg-yellow-400');
      expect(badge).toBeInTheDocument();

      // Priority 3 should be yellow
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 3 }} />);
      badge = container.querySelector('.bg-yellow-400');
      expect(badge).toBeInTheDocument();

      // Priority 2 should be orange
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 2 }} />);
      badge = container.querySelector('.bg-orange-500');
      expect(badge).toBeInTheDocument();

      // Priority 1 should be red
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 1 }} />);
      badge = container.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
    });
  });
});
