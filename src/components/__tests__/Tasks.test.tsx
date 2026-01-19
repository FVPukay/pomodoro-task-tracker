// src/components/__tests__/Tasks.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tasks from '../Tasks';

describe('Tasks Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the component with correct header', () => {
      render(<Tasks />);
      expect(screen.getByText('Tasks and Subtasks')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    });

    it('should show empty state when no tasks exist', () => {
      render(<Tasks />);
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Add your first task to get started')).toBeInTheDocument();
    });

    it('should not show footer stats when no tasks exist', () => {
      render(<Tasks />);
      expect(screen.queryByText(/of.*tasks completed/)).not.toBeInTheDocument();
    });
  });

  describe('Adding Tasks', () => {
    it('should add a new task when form is submitted', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      await user.type(input, 'New Task');
      await user.click(addButton);

      expect(await screen.findByText('New Task')).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('should add task on Enter key press', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');

      await user.type(input, 'Task via Enter{Enter}');

      expect(await screen.findByText('Task via Enter')).toBeInTheDocument();
    });

    it('should not add task with empty title', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const addButton = screen.getByRole('button', { name: 'Add' });
      await user.click(addButton);

      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });

    it('should clear input field after adding task', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      await user.type(input, 'New Task');
      await user.click(addButton);

      expect(input).toHaveValue('');
    });
  });

  describe('Task Operations', () => {
    it('should delete a task when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task to Delete{Enter}');

      // Wait for task to appear
      const task = await screen.findByText('Task to Delete');
      expect(task).toBeInTheDocument();

      // Find and click delete button (using aria-label)
      const deleteButton = screen.getByLabelText('Delete task');
      await user.click(deleteButton);

      // Task should be removed
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });

    it('should toggle task completion', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task to Complete{Enter}');

      // Wait for task and find checkbox
      await screen.findByText('Task to Complete');
      const checkboxes = screen.getAllByRole('checkbox');
      const taskCheckbox = checkboxes[0]; // First checkbox is the task checkbox

      // Initially unchecked
      expect(taskCheckbox).not.toBeChecked();

      // Click to complete
      await user.click(taskCheckbox);
      expect(taskCheckbox).toBeChecked();

      // Click to uncomplete
      await user.click(taskCheckbox);
      expect(taskCheckbox).not.toBeChecked();
    });

    it('should edit task title on double-click', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Original Title{Enter}');

      // Wait for task
      const taskTitle = await screen.findByText('Original Title');

      // Double-click to edit
      await user.dblClick(taskTitle);

      // Find input field and change value
      const editInput = screen.getByDisplayValue('Original Title');
      await user.clear(editInput);
      await user.type(editInput, 'Updated Title');

      // Press Enter or blur to save
      fireEvent.blur(editInput);

      // Verify title updated
      expect(await screen.findByText('Updated Title')).toBeInTheDocument();
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
    });
  });

  describe('Subtask Operations', () => {
    it('should show expand button on all tasks', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task with Subtasks{Enter}');

      await screen.findByText('Task with Subtasks');

      // Expand button should be visible even without subtasks
      const expandButton = screen.getByLabelText('Expand');
      expect(expandButton).toBeInTheDocument();

      // Initially, there should be no subtask input visible
      expect(screen.queryByPlaceholderText('Add a subtask...')).not.toBeInTheDocument();
    });

    it('should expand task to show subtask form', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task with Subtasks{Enter}');

      await screen.findByText('Task with Subtasks');

      // Click expand button
      const expandButton = screen.getByLabelText('Expand');
      await user.click(expandButton);

      // Subtask form should now be visible
      expect(await screen.findByPlaceholderText('Add a subtask...')).toBeInTheDocument();
    });

    it('should add a subtask to a task', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Parent Task{Enter}');

      await screen.findByText('Parent Task');

      // Click expand button to show subtask form
      const expandButton = screen.getByLabelText('Expand');
      await user.click(expandButton);

      // Wait for subtask input to appear
      const subtaskInput = await screen.findByPlaceholderText('Add a subtask...');
      expect(subtaskInput).toBeInTheDocument();

      // Add a subtask
      await user.type(subtaskInput, 'My Subtask{Enter}');

      // Subtask should appear
      expect(await screen.findByText('My Subtask')).toBeInTheDocument();
    });

    it('should show subtask count in task header', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task with Count{Enter}');

      await screen.findByText('Task with Count');

      // Expand and add subtasks
      const expandButton = screen.getByLabelText('Expand');
      await user.click(expandButton);

      const subtaskInput = await screen.findByPlaceholderText('Add a subtask...');
      await user.type(subtaskInput, 'Subtask 1{Enter}');
      await user.type(subtaskInput, 'Subtask 2{Enter}');

      // Should show count (0/2)
      expect(await screen.findByText('(0/2)')).toBeInTheDocument();
    });

    it('should collapse task when clicking expand button again', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Collapsible Task{Enter}');

      await screen.findByText('Collapsible Task');

      // Click expand
      const expandButton = screen.getByLabelText('Expand');
      await user.click(expandButton);

      // Subtask form visible
      expect(await screen.findByPlaceholderText('Add a subtask...')).toBeInTheDocument();

      // Click collapse
      const collapseButton = screen.getByLabelText('Collapse');
      await user.click(collapseButton);

      // Subtask form should be hidden
      expect(screen.queryByPlaceholderText('Add a subtask...')).not.toBeInTheDocument();
    });
  });

  describe('Footer Stats', () => {
    it('should show correct task completion stats', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add multiple tasks
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task 1{Enter}');
      await user.type(input, 'Task 2{Enter}');
      await user.type(input, 'Task 3{Enter}');

      // Wait for all tasks
      await screen.findByText('Task 1');
      await screen.findByText('Task 2');
      await screen.findByText('Task 3');

      // Check footer shows 0 of 3 completed
      expect(await screen.findByText(/0 of 3 tasks completed/)).toBeInTheDocument();

      // Complete first task
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // Check footer shows 1 of 3 completed
      expect(await screen.findByText(/1 of 3 tasks completed/)).toBeInTheDocument();
    });

    it('should show subtask count in footer', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Add a task
      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task 1{Enter}');

      await screen.findByText('Task 1');

      // Footer should show 0 subtasks
      expect(await screen.findByText(/0 subtasks total/)).toBeInTheDocument();
    });
  });

  describe('Persistence', () => {
    it('should persist tasks to localStorage', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Persistent Task{Enter}');

      await screen.findByText('Persistent Task');

      // Wait for localStorage to be updated
      await waitFor(() => {
        const saved = localStorage.getItem('pomodoro-tasks');
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.tasks).toHaveLength(1);
        expect(parsed.tasks[0].title).toBe('Persistent Task');
      });
    });

    it('should load tasks from localStorage on mount', () => {
      // Pre-populate localStorage
      const tasks = [
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
        tasks,
        lastModified: Date.now()
      }));

      render(<Tasks />);

      expect(screen.getByText('Existing Task')).toBeInTheDocument();
      expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');
      expect(input).toHaveAttribute('type', 'text');

      const button = screen.getByRole('button', { name: 'Add' });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should have accessible delete buttons with aria-labels', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task 1{Enter}');

      await screen.findByText('Task 1');

      const deleteButton = screen.getByLabelText('Delete task');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should have accessible checkboxes', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');
      await user.type(input, 'Task 1{Enter}');

      await screen.findByText('Task 1');

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });
  });

  describe('Multiple Tasks', () => {
    it('should handle multiple tasks correctly', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');

      // Add multiple tasks
      await user.type(input, 'Task 1{Enter}');
      await user.type(input, 'Task 2{Enter}');
      await user.type(input, 'Task 3{Enter}');

      // All tasks should be visible
      expect(await screen.findByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();

      // Footer should show correct count
      expect(screen.getByText(/0 of 3 tasks completed/)).toBeInTheDocument();
    });

    it('should maintain task order', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const input = screen.getByPlaceholderText('Add a new task...');

      await user.type(input, 'First{Enter}');
      await user.type(input, 'Second{Enter}');
      await user.type(input, 'Third{Enter}');

      await screen.findByText('First');

      const tasks = screen.getAllByText(/First|Second|Third/);
      expect(tasks[0]).toHaveTextContent('First');
      expect(tasks[1]).toHaveTextContent('Second');
      expect(tasks[2]).toHaveTextContent('Third');
    });
  });

  describe('Priority Input', () => {
    it('should render priority input with default value of 4', () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority');
      expect(priorityInput).toBeInTheDocument();
      expect(priorityInput).toHaveValue(4);
    });

    it('should accept valid priority values (1, 2, 3, 4, 6, 9)', async () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;
      const validValues = [1, 2, 3, 4, 6, 9];

      for (const value of validValues) {
        fireEvent.change(priorityInput, { target: { value: value.toString() } });
        expect(priorityInput.value).toBe(value.toString());
      }
    });

    it('should correct invalid priority values to nearest valid value', async () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;

      // Type invalid value and blur
      fireEvent.change(priorityInput, { target: { value: '5' } });
      fireEvent.blur(priorityInput);

      // Should correct to nearest valid value (4 or 6)
      const correctedValue = parseInt(priorityInput.value);
      expect([4, 6]).toContain(correctedValue);
    });

    it('should create task with selected priority', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority');
      const taskTitleInput = screen.getByPlaceholderText('Add a new task...');

      // Set priority to 9
      fireEvent.change(priorityInput, { target: { value: '9' } });

      // Add task
      await user.type(taskTitleInput, 'High Priority Task{Enter}');

      // Task should be created with priority 9
      await screen.findByText('High Priority Task');

      // Check localStorage to verify priority was saved
      await waitFor(() => {
        const saved = localStorage.getItem('pomodoro-tasks');
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.tasks[0].priority).toBe(9);
      });
    });

    it('should reset priority input to default (4) after creating task', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;
      const taskTitleInput = screen.getByPlaceholderText('Add a new task...');

      // Set priority to 1
      fireEvent.change(priorityInput, { target: { value: '1' } });
      expect(priorityInput.value).toBe('1');

      // Add task
      await user.type(taskTitleInput, 'Test Task{Enter}');
      await screen.findByText('Test Task');

      // Priority should reset to 4
      expect(priorityInput.value).toBe('4');
    });

    it('should handle out-of-range values', async () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;

      // Test value too low (0)
      fireEvent.change(priorityInput, { target: { value: '0' } });
      fireEvent.blur(priorityInput);
      expect(parseInt(priorityInput.value)).toBeGreaterThanOrEqual(1);

      // Test value too high (10)
      fireEvent.change(priorityInput, { target: { value: '10' } });
      fireEvent.blur(priorityInput);
      expect(parseInt(priorityInput.value)).toBeLessThanOrEqual(9);
    });

    it('should cycle through valid values with ArrowUp key', () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;

      // Start at 4, press ArrowUp -> should go to 6
      expect(priorityInput.value).toBe('4');
      fireEvent.keyDown(priorityInput, { key: 'ArrowUp' });
      expect(priorityInput.value).toBe('6');

      // Press ArrowUp again -> should go to 9
      fireEvent.keyDown(priorityInput, { key: 'ArrowUp' });
      expect(priorityInput.value).toBe('9');

      // Press ArrowUp again -> should wrap to 1
      fireEvent.keyDown(priorityInput, { key: 'ArrowUp' });
      expect(priorityInput.value).toBe('1');
    });

    it('should cycle through valid values with ArrowDown key', () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;

      // Start at 4, press ArrowDown -> should go to 3
      expect(priorityInput.value).toBe('4');
      fireEvent.keyDown(priorityInput, { key: 'ArrowDown' });
      expect(priorityInput.value).toBe('3');

      // Press ArrowDown again -> should go to 2
      fireEvent.keyDown(priorityInput, { key: 'ArrowDown' });
      expect(priorityInput.value).toBe('2');

      // Press ArrowDown again -> should go to 1
      fireEvent.keyDown(priorityInput, { key: 'ArrowDown' });
      expect(priorityInput.value).toBe('1');

      // Press ArrowDown again -> should wrap to 9
      fireEvent.keyDown(priorityInput, { key: 'ArrowDown' });
      expect(priorityInput.value).toBe('9');
    });

    it('should skip invalid values when cycling with arrow keys', () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;

      // Set to 3, press ArrowUp -> should skip to 4 (not 3.5 or invalid values)
      fireEvent.change(priorityInput, { target: { value: '3' } });
      fireEvent.keyDown(priorityInput, { key: 'ArrowUp' });
      expect(priorityInput.value).toBe('4');

      // From 4, press ArrowUp -> should skip to 6 (not 5)
      fireEvent.keyDown(priorityInput, { key: 'ArrowUp' });
      expect(priorityInput.value).toBe('6');
    });

    it('should not allow invalid values when spinner arrows are clicked', () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;

      // Start at 4 (default)
      expect(priorityInput.value).toBe('4');

      // Scroll up from 4 to 5 -> should go to next higher valid value (6)
      fireEvent.change(priorityInput, { target: { value: '5' } });
      expect(priorityInput.value).toBe('6');

      // Scroll up from 6 to 7 -> should go to next higher valid value (9)
      fireEvent.change(priorityInput, { target: { value: '7' } });
      expect(priorityInput.value).toBe('9');

      // Scroll down from 9 to 8 -> should go to next lower valid value (6)
      fireEvent.change(priorityInput, { target: { value: '8' } });
      expect(priorityInput.value).toBe('6');

      // Scroll down from 6 to 5 -> should go to next lower valid value (4)
      fireEvent.change(priorityInput, { target: { value: '5' } });
      expect(priorityInput.value).toBe('4');

      // Scroll up from 4 to 5 -> should go to next higher valid value (6)
      fireEvent.change(priorityInput, { target: { value: '5' } });
      expect(priorityInput.value).toBe('6');
    });

    it('should always show valid priority values only', () => {
      render(<Tasks />);

      const priorityInput = screen.getByLabelText('Task priority') as HTMLInputElement;
      const validPriorityValues = [1, 2, 3, 4, 6, 9];
      const invalidValues = [5, 7, 8];

      for (const invalidValue of invalidValues) {
        fireEvent.change(priorityInput, { target: { value: invalidValue.toString() } });
        const currentValue = parseInt(priorityInput.value);

        // Value should be corrected to a valid priority
        expect(validPriorityValues.includes(currentValue)).toBe(true);
        expect(invalidValues.includes(currentValue)).toBe(false);
      }
    });
  });

  describe('Priority Matrix Dialog', () => {
    it('should render Priority Matrix button in header', () => {
      render(<Tasks />);

      const button = screen.getByLabelText('Open Priority Matrix');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Priority Matrix');
    });

    it('should open dialog when Priority Matrix button is clicked', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const button = screen.getByLabelText('Open Priority Matrix');
      await user.click(button);

      // Dialog should be visible with proper accessibility attributes
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should render PriorityMatrix component inside dialog', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const button = screen.getByLabelText('Open Priority Matrix');
      await user.click(button);

      // Priority Matrix content should be visible (check for unique content from PriorityMatrix component)
      expect(screen.getByText('From Taro')).toBeInTheDocument();
      expect(screen.getByText('High Impact (3)')).toBeInTheDocument();
    });

    it('should close dialog when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Open dialog
      const button = screen.getByLabelText('Open Priority Matrix');
      await user.click(button);

      // Dialog should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click backdrop (the dialog overlay itself)
      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      // Dialog should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Open dialog
      const button = screen.getByLabelText('Open Priority Matrix');
      await user.click(button);

      // Dialog should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click close button
      const closeButton = screen.getByLabelText('Close Priority Matrix dialog');
      await user.click(closeButton);

      // Dialog should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Open dialog
      const button = screen.getByLabelText('Open Priority Matrix');
      await user.click(button);

      // Dialog should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Press Escape key
      await user.keyboard('{Escape}');

      // Dialog should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should not close dialog when clicking inside dialog content', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Open dialog
      const button = screen.getByLabelText('Open Priority Matrix');
      await user.click(button);

      // Dialog should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click inside the dialog content (on unique content from PriorityMatrix)
      const dialogContent = screen.getByText('From Taro');
      await user.click(dialogContent);

      // Dialog should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible close button with proper aria-label', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      // Open dialog
      const button = screen.getByLabelText('Open Priority Matrix');
      await user.click(button);

      // Close button should have proper aria-label
      const closeButton = screen.getByLabelText('Close Priority Matrix dialog');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
