import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../Settings';

describe('Settings Component', () => {
  const defaultProps = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 30,
    onFocusTimeChange: jest.fn(),
    onShortBreakTimeChange: jest.fn(),
    onLongBreakTimeChange: jest.fn(),
    isTimerRunning: false,
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Behavior #5: Settings inputs disabled when timer running', () => {
    it('should disable all inputs when timer is running', () => {
      render(<Settings {...defaultProps} isTimerRunning={true} />);

      const focusInput = screen.getByDisplayValue('25');
      const shortBreakInput = screen.getByDisplayValue('5');
      const longBreakInput = screen.getByDisplayValue('30');

      expect(focusInput).toBeDisabled();
      expect(shortBreakInput).toBeDisabled();
      expect(longBreakInput).toBeDisabled();
    });

    it('should enable all inputs when timer is not running', () => {
      render(<Settings {...defaultProps} isTimerRunning={false} />);

      const focusInput = screen.getByDisplayValue('25');
      const shortBreakInput = screen.getByDisplayValue('5');
      const longBreakInput = screen.getByDisplayValue('30');

      expect(focusInput).not.toBeDisabled();
      expect(shortBreakInput).not.toBeDisabled();
      expect(longBreakInput).not.toBeDisabled();
    });

    it('should disable reset button when timer is running', () => {
      render(<Settings {...defaultProps} isTimerRunning={true} />);

      const resetButton = screen.getByLabelText(/reset settings/i);
      expect(resetButton).toBeDisabled();
    });

    it('should enable reset button when timer is not running', () => {
      render(<Settings {...defaultProps} isTimerRunning={false} />);

      const resetButton = screen.getByLabelText(/reset settings/i);
      expect(resetButton).not.toBeDisabled();
    });
  });

  describe('Behavior #6: Timer display syncs when settings change (only when stopped)', () => {
    it('should call onFocusTimeChange when focus input changes', () => {
      const onFocusTimeChange = jest.fn();
      render(<Settings {...defaultProps} onFocusTimeChange={onFocusTimeChange} />);

      const focusInput = screen.getByDisplayValue('25');
      fireEvent.change(focusInput, { target: { value: '30' } });

      expect(onFocusTimeChange).toHaveBeenCalledWith(30);
    });

    it('should call onShortBreakTimeChange when short break input changes', () => {
      const onShortBreakTimeChange = jest.fn();
      render(<Settings {...defaultProps} onShortBreakTimeChange={onShortBreakTimeChange} />);

      const shortBreakInput = screen.getByDisplayValue('5');
      fireEvent.change(shortBreakInput, { target: { value: '10' } });

      expect(onShortBreakTimeChange).toHaveBeenCalledWith(10);
    });

    it('should call onLongBreakTimeChange when long break input changes', () => {
      const onLongBreakTimeChange = jest.fn();
      render(<Settings {...defaultProps} onLongBreakTimeChange={onLongBreakTimeChange} />);

      const longBreakInput = screen.getByDisplayValue('30');
      fireEvent.change(longBreakInput, { target: { value: '45' } });

      expect(onLongBreakTimeChange).toHaveBeenCalledWith(45);
    });
  });

  describe('Behavior #14: Reset button in Settings section', () => {
    it('should show confirmation dialog when reset button is clicked', () => {
      render(<Settings {...defaultProps} />);

      const resetButton = screen.getByLabelText(/reset settings/i);
      fireEvent.click(resetButton);

      // Dialog should appear
      expect(screen.getByText(/reset settings to defaults/i)).toBeInTheDocument();
      expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });

    it('should call onReset when confirm button is clicked', () => {
      const onReset = jest.fn();
      render(<Settings {...defaultProps} onReset={onReset} />);

      // Open dialog
      const resetButton = screen.getByLabelText(/reset settings/i);
      fireEvent.click(resetButton);

      // Confirm - get the "Reset" button inside the dialog
      const resetButtons = screen.getAllByText(/reset/i);
      const confirmButton = resetButtons.find(btn => btn.classList.contains('bg-red-600'));
      fireEvent.click(confirmButton!);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('should close dialog when cancel button is clicked', () => {
      const onReset = jest.fn();
      render(<Settings {...defaultProps} onReset={onReset} />);

      // Open dialog
      const resetButton = screen.getByLabelText(/reset settings/i);
      fireEvent.click(resetButton);

      // Cancel
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      // Dialog should be gone
      expect(screen.queryByText(/reset settings to defaults/i)).not.toBeInTheDocument();
      expect(onReset).not.toHaveBeenCalled();
    });
  });
});
