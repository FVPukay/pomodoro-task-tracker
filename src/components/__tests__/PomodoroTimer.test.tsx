// src/components/__tests__/PomodoroTimer.test.tsx
// Phase 1: Bug Fixes with Test-First Approach

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PomodoroTimer from '../PomodoroTimer';

describe('PomodoroTimer Component - Bug Fixes', () => {
  const defaultProps = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 30,
    completedPomodoros: 0,
    onPomodoroComplete: jest.fn(),
    onRunningChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Bug #1: Progress bars should not update when settings change while timer is paused', () => {
    it('should maintain progress percentage when focusTime increases during paused session', () => {
      // Start with 1 minute focus time
      const { rerender, container } = render(
        <PomodoroTimer {...defaultProps} focusTime={1} />
      );

      // Start the timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Advance 5 seconds (out of 60 seconds = ~8.3% progress)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Pause the timer
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Get the outer progress ring SVG circle
      const progressCircle = container.querySelector('circle[stroke="url(#progressGradient)"]');
      expect(progressCircle).toBeInTheDocument();

      // Calculate expected stroke-dashoffset for ~8.3% progress
      // circumference = 2 * π * 144 ≈ 904.78
      // dashoffset = circumference * (1 - progress/100) = 904.78 * (1 - 0.083) ≈ 829.68
      const circumference = 2 * Math.PI * 144;
      const expectedProgress = 8.33; // (60-55)/60 * 100
      const expectedDashoffset = circumference * (1 - expectedProgress / 100);

      const initialDashoffset = progressCircle?.getAttribute('stroke-dashoffset');
      expect(parseFloat(initialDashoffset || '0')).toBeCloseTo(expectedDashoffset, 0);

      // Change focus time from 1 minute to 10 minutes while paused
      rerender(
        <PomodoroTimer {...defaultProps} focusTime={10} />
      );

      // BUG: Progress should stay at ~8.3%, but it incorrectly shows ~90.8%
      // because it uses new focusTime (10 min) instead of sessionStartFocusTime (1 min)

      // Get updated dashoffset
      const updatedDashoffset = progressCircle?.getAttribute('stroke-dashoffset');

      // Progress should NOT change (should still be ~8.3%, not ~90.8%)
      expect(parseFloat(updatedDashoffset || '0')).toBeCloseTo(expectedDashoffset, 0);
    });

    it('should maintain progress percentage when focusTime decreases during paused session', () => {
      // Start with 10 minute focus time
      const { rerender, container } = render(
        <PomodoroTimer {...defaultProps} focusTime={10} />
      );

      // Start the timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Advance 5 seconds (out of 600 seconds = ~0.83% progress)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Pause the timer
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Get initial progress
      const progressCircle = container.querySelector('circle[stroke="url(#progressGradient)"]');
      const circumference = 2 * Math.PI * 144;
      const expectedProgress = 0.83; // (600-595)/600 * 100
      const expectedDashoffset = circumference * (1 - expectedProgress / 100);

      const initialDashoffset = progressCircle?.getAttribute('stroke-dashoffset');
      expect(parseFloat(initialDashoffset || '0')).toBeCloseTo(expectedDashoffset, 0);

      // Change focus time from 10 minutes to 5 minutes while paused
      rerender(
        <PomodoroTimer {...defaultProps} focusTime={5} />
      );

      // Progress should NOT change (should still be ~0.83%, not ~1.67%)
      const updatedDashoffset = progressCircle?.getAttribute('stroke-dashoffset');
      expect(parseFloat(updatedDashoffset || '0')).toBeCloseTo(expectedDashoffset, 0);
    });

    it('should maintain inner circle progress when settings change during paused session', () => {
      // Start with 1 minute focus time
      const { rerender, container } = render(
        <PomodoroTimer {...defaultProps} focusTime={1} completedPomodoros={0} />
      );

      // Start the timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Advance 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Pause
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Find the active pomodoro circle (first one, index 0)
      const circles = container.querySelectorAll('.rounded-full.overflow-hidden');
      const activeCircle = circles[0];
      const activeCircleFill = activeCircle.querySelector('.absolute');

      expect(activeCircleFill).toBeInTheDocument();

      // Get initial clip-path (should represent ~8.3% progress)
      const initialClipPath = (activeCircleFill as HTMLElement)?.style.clipPath;

      // Change focus time from 1 to 10 minutes
      rerender(
        <PomodoroTimer {...defaultProps} focusTime={10} completedPomodoros={0} />
      );

      // Clip-path should NOT change (progress should stay ~8.3%)
      const updatedClipPath = (activeCircleFill as HTMLElement)?.style.clipPath;
      expect(updatedClipPath).toBe(initialClipPath);
    });
  });

  describe('Bug #2: All circles incorrectly filled when skipping to break with 0 completed pomodoros', () => {
    it('should not fill all circles when clicking Next from initial state', () => {
      // Start at initial state (0 completed pomodoros, focus session)
      const { container } = render(
        <PomodoroTimer {...defaultProps} completedPomodoros={0} />
      );

      // Initially in focus session - no circles should be filled yet (session hasn't started)
      let circles = container.querySelectorAll('.rounded-full.overflow-hidden');
      expect(circles).toHaveLength(4);

      // Click Next to go to break
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // BUG: When completedPomodoros=0 and we're in break, the condition
      // (completedPomodoros % 4 === 0 && !isFocusSession) evaluates to true
      // and shows all 4 circles filled, but should show 0 circles filled
      circles = container.querySelectorAll('.rounded-full.overflow-hidden');

      // Count filled circles (those with an .absolute div inside)
      const filledCircles = Array.from(circles).filter(circle =>
        circle.querySelector('.absolute')
      );

      // Should have 0 filled circles (no pomodoros completed yet)
      expect(filledCircles).toHaveLength(0);
    });

    it('should correctly show 4 filled circles during long break after completing 4 pomodoros', () => {
      // Start with 4 completed pomodoros
      const { container } = render(
        <PomodoroTimer {...defaultProps} completedPomodoros={4} />
      );

      // Skip to long break
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show all 4 circles filled (just completed the 4th pomodoro set)
      const circles = container.querySelectorAll('.rounded-full.overflow-hidden');
      const filledCircles = Array.from(circles).filter(circle =>
        circle.querySelector('.absolute')
      );

      // Should have all 4 circles filled
      expect(filledCircles).toHaveLength(4);
    });

    it('should show 0 filled circles when skipping from focus to break with 0 completed', () => {
      // This is the exact scenario from the bug report
      const { container } = render(
        <PomodoroTimer {...defaultProps} completedPomodoros={0} />
      );

      // Click next button
      const nextButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(nextButton);

      // Verify we're now in a break session
      expect(screen.getByText(/break/i)).toBeInTheDocument();

      // No circles should be filled (no pomodoros completed)
      const circles = container.querySelectorAll('.rounded-full.overflow-hidden');
      const filledCircles = Array.from(circles).filter(circle =>
        circle.querySelector('.absolute')
      );

      expect(filledCircles).toHaveLength(0);
    });

    it('should show 1 filled circle during break after completing 1 pomodoro', () => {
      // Start with 1 completed pomodoro, in focus session
      const { container } = render(
        <PomodoroTimer {...defaultProps} completedPomodoros={1} />
      );

      // Skip to break
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show 1 circle filled
      const circles = container.querySelectorAll('.rounded-full.overflow-hidden');
      const filledCircles = Array.from(circles).filter(circle =>
        circle.querySelector('.absolute')
      );

      expect(filledCircles).toHaveLength(1);
    });

    it('should show 2 filled circles during break after completing 2 pomodoros', () => {
      const { container } = render(
        <PomodoroTimer {...defaultProps} completedPomodoros={2} />
      );

      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      const circles = container.querySelectorAll('.rounded-full.overflow-hidden');
      const filledCircles = Array.from(circles).filter(circle =>
        circle.querySelector('.absolute')
      );

      expect(filledCircles).toHaveLength(2);
    });

    it('should show 3 filled circles during break after completing 3 pomodoros', () => {
      const { container } = render(
        <PomodoroTimer {...defaultProps} completedPomodoros={3} />
      );

      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      const circles = container.querySelectorAll('.rounded-full.overflow-hidden');
      const filledCircles = Array.from(circles).filter(circle =>
        circle.querySelector('.absolute')
      );

      expect(filledCircles).toHaveLength(3);
    });
  });
});
