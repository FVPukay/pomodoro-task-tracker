import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Completed from '../Completed';

describe('Completed Component', () => {
  const defaultProps = {
    completedPomodoros: 0,
    totalFocusMinutes: 0,
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Behavior #11: Completing pomodoro increments count', () => {
    it('should display 0 pomodoros initially', () => {
      render(<Completed {...defaultProps} />);

      expect(screen.getByText('Pomodoros')).toBeInTheDocument();
      // There are multiple "0" values (pomodoros and sets), so check that at least one exists
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('should display correct count after completing pomodoros', () => {
      render(<Completed {...defaultProps} completedPomodoros={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display correct count for multiple pomodoros', () => {
      const { rerender } = render(<Completed {...defaultProps} completedPomodoros={1} />);
      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(<Completed {...defaultProps} completedPomodoros={10} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Behavior #12: Total focus minutes calculated correctly', () => {
    it('should display 0 minutes initially', () => {
      render(<Completed {...defaultProps} totalFocusMinutes={0} />);

      expect(screen.getByText(/total focus time/i)).toBeInTheDocument();
      expect(screen.getByText('0m')).toBeInTheDocument();
    });

    it('should display minutes only for less than 60 minutes', () => {
      render(<Completed {...defaultProps} totalFocusMinutes={45} />);

      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    it('should display hours and minutes for 60+ minutes', () => {
      render(<Completed {...defaultProps} totalFocusMinutes={90} />);

      // 90 minutes = 1h 30m
      expect(screen.getByText('1h 30m')).toBeInTheDocument();
    });

    it('should calculate sets correctly (1 set = 4 pomodoros)', () => {
      const { rerender } = render(<Completed {...defaultProps} completedPomodoros={0} />);
      expect(screen.getByText('Sets')).toBeInTheDocument();
      // Check that we have at least two "0" values (pomodoros and sets)
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);

      // 3 pomodoros = 0 sets
      rerender(<Completed {...defaultProps} completedPomodoros={3} />);
      expect(screen.getByText('3')).toBeInTheDocument(); // pomodoros
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1); // sets

      // 4 pomodoros = 1 set
      rerender(<Completed {...defaultProps} completedPomodoros={4} />);
      expect(screen.getByText('4')).toBeInTheDocument(); // pomodoros
      expect(screen.getByText('1')).toBeInTheDocument(); // sets

      // 8 pomodoros = 2 sets
      rerender(<Completed {...defaultProps} completedPomodoros={8} />);
      expect(screen.getByText('8')).toBeInTheDocument(); // pomodoros
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1); // sets

      // 10 pomodoros = 2 sets (not 2.5)
      rerender(<Completed {...defaultProps} completedPomodoros={10} />);
      expect(screen.getByText('10')).toBeInTheDocument(); // pomodoros
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1); // sets (Math.floor(10/4) = 2)
    });

    it('should display total focus time for multiple completed pomodoros', () => {
      // 5 pomodoros * 25 minutes = 125 minutes = 2h 5m
      render(<Completed {...defaultProps} completedPomodoros={5} totalFocusMinutes={125} />);

      expect(screen.getByText('2h 5m')).toBeInTheDocument();
    });
  });

  describe('Behavior #13: Reset button in Completed section', () => {
    it('should show confirmation dialog when reset button is clicked', () => {
      render(<Completed {...defaultProps} />);

      const resetButton = screen.getByLabelText(/reset completed stats/i);
      fireEvent.click(resetButton);

      // Dialog should appear
      expect(screen.getByText(/reset completed stats\?/i)).toBeInTheDocument();
      expect(screen.getByText(/this will reset all completed pomodoros/i)).toBeInTheDocument();
      expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });

    it('should call onReset when confirm button is clicked', () => {
      const onReset = jest.fn();
      render(<Completed {...defaultProps} onReset={onReset} />);

      // Open dialog
      const resetButton = screen.getByLabelText(/reset completed stats/i);
      fireEvent.click(resetButton);

      // Confirm - need to get the "Reset" button inside the dialog
      const confirmButtons = screen.getAllByText(/reset/i);
      const confirmButton = confirmButtons.find(btn => btn.classList.contains('bg-red-600'));
      fireEvent.click(confirmButton!);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('should close dialog and NOT call onReset when cancel is clicked', () => {
      const onReset = jest.fn();
      render(<Completed {...defaultProps} onReset={onReset} />);

      // Open dialog
      const resetButton = screen.getByLabelText(/reset completed stats/i);
      fireEvent.click(resetButton);

      // Cancel
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      // Dialog should be gone
      expect(screen.queryByText(/this will reset all completed pomodoros/i)).not.toBeInTheDocument();
      expect(onReset).not.toHaveBeenCalled();
    });

    it('should close dialog when clicking backdrop', () => {
      const onReset = jest.fn();
      const { container } = render(<Completed {...defaultProps} onReset={onReset} />);

      // Open dialog
      const resetButton = screen.getByLabelText(/reset completed stats/i);
      fireEvent.click(resetButton);

      // Click backdrop
      const backdrop = container.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);

      // Dialog should be gone
      expect(screen.queryByText(/this will reset all completed pomodoros/i)).not.toBeInTheDocument();
      expect(onReset).not.toHaveBeenCalled();
    });
  });
});
