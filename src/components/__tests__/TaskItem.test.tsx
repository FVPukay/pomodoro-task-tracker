// src/components/__tests__/TaskItem.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    priority: 4
  };

  const defaultProps = {
    task: mockTask,
    index: 0,
    onToggleComplete: jest.fn(),
    onToggleExpanded: jest.fn(),
    onDelete: jest.fn(),
    onUpdateTitle: jest.fn(),
    onUpdatePriority: jest.fn(),
    onAddSubtask: jest.fn(),
    onDeleteSubtask: jest.fn(),
    onToggleSubtaskComplete: jest.fn(),
    onUpdateSubtaskTitle: jest.fn(),
    onReorderSubtasks: jest.fn(),
    onDragStart: jest.fn(),
    onDragOver: jest.fn(),
    onDrop: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Priority Input', () => {
    it('should render priority input with correct value', () => {
      render(<TaskItem {...defaultProps} />);

      const priorityInput = screen.getByLabelText('Task priority');
      expect(priorityInput).toBeInTheDocument();
      expect(priorityInput).toHaveValue(4);
    });

    it('should display different priority values', () => {
      const { rerender } = render(<TaskItem {...defaultProps} />);
      expect(screen.getByLabelText('Task priority')).toHaveValue(4);

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 9 }} />);
      expect(screen.getByLabelText('Task priority')).toHaveValue(9);

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 6 }} />);
      expect(screen.getByLabelText('Task priority')).toHaveValue(6);

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 3 }} />);
      expect(screen.getByLabelText('Task priority')).toHaveValue(3);

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 2 }} />);
      expect(screen.getByLabelText('Task priority')).toHaveValue(2);

      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 1 }} />);
      expect(screen.getByLabelText('Task priority')).toHaveValue(1);
    });

    it('should have correct color styling based on priority', () => {
      const { container, rerender } = render(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 9 }} />);

      // Priority 9 should be dark green
      let input = container.querySelector('.bg-green-700');
      expect(input).toBeInTheDocument();

      // Priority 6 should be light green
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 6 }} />);
      input = container.querySelector('.bg-green-400');
      expect(input).toBeInTheDocument();

      // Priority 4 should be yellow
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 4 }} />);
      input = container.querySelector('.bg-yellow-400');
      expect(input).toBeInTheDocument();

      // Priority 3 should be yellow
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 3 }} />);
      input = container.querySelector('.bg-yellow-400');
      expect(input).toBeInTheDocument();

      // Priority 2 should be orange
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 2 }} />);
      input = container.querySelector('.bg-orange-500');
      expect(input).toBeInTheDocument();

      // Priority 1 should be red
      rerender(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 1 }} />);
      input = container.querySelector('.bg-red-500');
      expect(input).toBeInTheDocument();
    });

    it('should call onUpdatePriority when value changes to valid priority', () => {
      render(<TaskItem {...defaultProps} />);

      const priorityInput = screen.getByLabelText('Task priority');

      // Change to priority 9
      fireEvent.change(priorityInput, { target: { value: '9' } });

      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('1', 9);
    });

    it('should cycle through valid values with ArrowUp key', () => {
      render(<TaskItem {...defaultProps} />);

      const priorityInput = screen.getByLabelText('Task priority');

      // Start at 4, press ArrowUp -> should call with 6
      fireEvent.keyDown(priorityInput, { key: 'ArrowUp' });
      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('1', 6);
    });

    it('should cycle through valid values with ArrowDown key', () => {
      render(<TaskItem {...defaultProps} />);

      const priorityInput = screen.getByLabelText('Task priority');

      // Start at 4, press ArrowDown -> should call with 3
      fireEvent.keyDown(priorityInput, { key: 'ArrowDown' });
      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('1', 3);
    });

    it('should wrap around when cycling with ArrowUp at max value', () => {
      render(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 9 }} />);

      const priorityInput = screen.getByLabelText('Task priority');

      // At 9, press ArrowUp -> should wrap to 1
      fireEvent.keyDown(priorityInput, { key: 'ArrowUp' });
      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('1', 1);
    });

    it('should wrap around when cycling with ArrowDown at min value', () => {
      render(<TaskItem {...defaultProps} task={{ ...mockTask, priority: 1 }} />);

      const priorityInput = screen.getByLabelText('Task priority');

      // At 1, press ArrowDown -> should wrap to 9
      fireEvent.keyDown(priorityInput, { key: 'ArrowDown' });
      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('1', 9);
    });

    it('should correct invalid values to nearest valid value on change', () => {
      render(<TaskItem {...defaultProps} />);

      const priorityInput = screen.getByLabelText('Task priority');

      // Type invalid value 5 (should go to 6 since increasing from 4)
      fireEvent.change(priorityInput, { target: { value: '5' } });

      // Should call with nearest valid value
      expect(defaultProps.onUpdatePriority).toHaveBeenCalled();
      const calls = defaultProps.onUpdatePriority.mock.calls;
      const lastCallPriority = calls[calls.length - 1][1];
      expect([4, 6]).toContain(lastCallPriority);
    });

    it('should not have priority slider in expanded view', async () => {
      const user = userEvent.setup();
      render(<TaskItem {...defaultProps} task={{ ...mockTask, expanded: true }} />);

      // There should be no range input (slider)
      const rangeInputs = screen.queryAllByRole('slider');
      expect(rangeInputs).toHaveLength(0);
    });
  });

  describe('Long Task Names', () => {
    it('should render task with very long name without breaking layout', () => {
      const longName = 'a'.repeat(200);
      render(<TaskItem {...defaultProps} task={{ ...mockTask, title: longName }} />);

      // Task should still render (collapsed view has title attribute)
      const taskTitle = screen.getByTitle(longName);
      expect(taskTitle).toBeInTheDocument();

      // Priority input should still be accessible
      const priorityInput = screen.getByLabelText('Task priority');
      expect(priorityInput).toBeInTheDocument();

      // Delete button should still be accessible
      const deleteButton = screen.getByLabelText('Delete task');
      expect(deleteButton).toBeInTheDocument();

      // Expand button should still be accessible
      const expandButton = screen.getByLabelText('Expand');
      expect(expandButton).toBeInTheDocument();
    });

    it('should truncate long task names in collapsed view', () => {
      const longName = 'This is a very long task name that should be truncated with ellipsis when displayed';
      const { container } = render(<TaskItem {...defaultProps} task={{ ...mockTask, title: longName, expanded: false }} />);

      // The title element should have truncate class when collapsed
      const titleElement = container.querySelector('h3.truncate');
      expect(titleElement).toBeInTheDocument();
    });

    it('should show full title on hover via title attribute when collapsed', () => {
      const longName = 'This is a very long task name that should show full text on hover';
      render(<TaskItem {...defaultProps} task={{ ...mockTask, title: longName, expanded: false }} />);

      const titleElement = screen.getByTitle(longName);
      expect(titleElement).toHaveAttribute('title', longName);
    });

    it('should show full title (wrapped) when expanded', () => {
      const longName = 'This is a very long task name that should wrap and show fully when the task is expanded';
      const { container } = render(<TaskItem {...defaultProps} task={{ ...mockTask, title: longName, expanded: true }} />);

      // The title element should have break-all class when expanded (not truncate)
      const titleElement = container.querySelector('h3.break-all');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent(longName);

      // Should NOT have truncate class
      const truncatedElement = container.querySelector('h3.truncate');
      expect(truncatedElement).not.toBeInTheDocument();
    });

    it('should not have title attribute when expanded (full text visible)', () => {
      const longName = 'This is a very long task name';
      const { container } = render(<TaskItem {...defaultProps} task={{ ...mockTask, title: longName, expanded: true }} />);

      // When expanded, no title attribute needed since full text is visible
      const titleElement = container.querySelector('h3');
      expect(titleElement).not.toHaveAttribute('title');
    });
  });
});
