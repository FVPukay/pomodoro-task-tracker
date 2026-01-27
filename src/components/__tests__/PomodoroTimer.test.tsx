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

  describe('Behavior #1: Timer countdown mechanics', () => {
    it('should count down from focus time when started', () => {
      render(<PomodoroTimer {...defaultProps} focusTime={25} />);

      // Start timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Verify initial time display (25:00)
      expect(screen.getByText(/25:00/)).toBeInTheDocument();

      // Advance 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should now show 24:59
      expect(screen.getByText(/24:59/)).toBeInTheDocument();

      // Advance 59 more seconds (total 1 minute)
      act(() => {
        jest.advanceTimersByTime(59000);
      });

      // Should now show 24:00
      expect(screen.getByText(/24:00/)).toBeInTheDocument();
    });

    it('should stop counting when paused', () => {
      render(<PomodoroTimer {...defaultProps} focusTime={25} />);

      // Start timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Advance 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByText(/24:55/)).toBeInTheDocument();

      // Pause timer
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Advance 10 more seconds
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Time should not have changed
      expect(screen.getByText(/24:55/)).toBeInTheDocument();
    });

    it('should resume countdown from paused time', () => {
      render(<PomodoroTimer {...defaultProps} focusTime={25} />);

      // Start, advance, pause
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      expect(screen.getByText(/24:55/)).toBeInTheDocument();

      // Resume
      const resumeButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(resumeButton);

      // Advance 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should continue from 24:55 → 24:54
      expect(screen.getByText(/24:54/)).toBeInTheDocument();
    });
  });

  describe('Behavior #2: Focus → Short Break → Focus transitions', () => {
    it('should transition from focus to short break when timer completes', () => {
      const onPomodoroComplete = jest.fn();
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={5}
          completedPomodoros={0}
          onPomodoroComplete={onPomodoroComplete}
        />
      );

      // Start focus timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Should show "Focus" initially
      expect(screen.getByText(/focus/i)).toBeInTheDocument();
      expect(screen.getByText(/1:00/)).toBeInTheDocument();

      // Complete focus session
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should transition to short break
      expect(screen.getByText(/break/i)).toBeInTheDocument();
      expect(screen.getByText(/5:00/)).toBeInTheDocument();
      expect(onPomodoroComplete).toHaveBeenCalledTimes(1);
    });

    it('should transition from short break to focus when timer completes', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={25}
          shortBreakTime={1}
          completedPomodoros={1}
        />
      );

      // Skip to break
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      expect(screen.getByText(/break/i)).toBeInTheDocument();

      // Start break timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Complete break
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should transition back to focus
      expect(screen.getByText(/focus/i)).toBeInTheDocument();
      expect(screen.getByText(/25:00/)).toBeInTheDocument();
    });

    it('should auto-start next session after completion', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={1}
          completedPomodoros={0}
        />
      );

      // Start focus timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Complete focus session
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should be in break and timer should be running
      expect(screen.getByText(/break/i)).toBeInTheDocument();

      // Advance time to verify timer is counting
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should show 0:59 (timer counting down from 1:00)
      expect(screen.getByText(/0:59/)).toBeInTheDocument();
    });
  });

  describe('Behavior #3: Long break after 4th pomodoro', () => {
    it('should use short break after 1st pomodoro', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={3}
          longBreakTime={10}
          completedPomodoros={1}
        />
      );

      // Skip to break
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show short break time (3 minutes), not long break (10 minutes)
      expect(screen.getByText(/3:00/)).toBeInTheDocument();
      expect(screen.getByText(/break/i)).toBeInTheDocument();
    });

    it('should use short break after 2nd pomodoro', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={3}
          longBreakTime={10}
          completedPomodoros={2}
        />
      );

      // Skip to break after 2nd pomodoro
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show short break
      expect(screen.getByText(/3:00/)).toBeInTheDocument();
    });

    it('should use short break after 3rd pomodoro', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={3}
          longBreakTime={10}
          completedPomodoros={3}
        />
      );

      // Skip to break after 3rd pomodoro
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show short break
      expect(screen.getByText(/3:00/)).toBeInTheDocument();
    });

    it('should use long break after 4th pomodoro', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={3}
          longBreakTime={10}
          completedPomodoros={4}
        />
      );

      // Skip to break
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show long break time (10 minutes), not short break (3 minutes)
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
      expect(screen.getByText(/break/i)).toBeInTheDocument();
    });

    it('should use long break after 8th pomodoro', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={3}
          longBreakTime={10}
          completedPomodoros={8}
        />
      );

      // Skip to break after 8th
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show long break
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
    });

    it('should use long break after 12th pomodoro', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={3}
          longBreakTime={10}
          completedPomodoros={12}
        />
      );

      // Skip to break after 12th
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show long break
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
    });

    it('should NOT use long break after 5th pomodoro', () => {
      render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={3}
          longBreakTime={10}
          completedPomodoros={5}
        />
      );

      // Skip to break
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Should show short break, not long break
      expect(screen.getByText(/3:00/)).toBeInTheDocument();
    });
  });

  describe('Behavior #4: Button behaviors (Reset, Skip, Start/Pause)', () => {
    describe('Reset button', () => {
      it('should stop timer and reset to mode time', () => {
        render(<PomodoroTimer {...defaultProps} focusTime={25} />);

        // Start and advance
        fireEvent.click(screen.getByLabelText(/start timer/i));
        act(() => jest.advanceTimersByTime(5000));

        expect(screen.getByText(/24:55/)).toBeInTheDocument();

        // Reset
        fireEvent.click(screen.getByLabelText(/reset timer/i));

        // Should reset to 25:00
        expect(screen.getByText(/25:00/)).toBeInTheDocument();

        // Advance time - should NOT count down (timer stopped)
        act(() => jest.advanceTimersByTime(5000));
        expect(screen.getByText(/25:00/)).toBeInTheDocument();
      });

      it('should clear sessionStartFocusTime on reset', () => {
        const { container, rerender } = render(
          <PomodoroTimer {...defaultProps} focusTime={1} />
        );

        // Start timer (captures sessionStartFocusTime=1)
        fireEvent.click(screen.getByLabelText(/start timer/i));
        act(() => jest.advanceTimersByTime(5000));

        // Reset
        fireEvent.click(screen.getByLabelText(/reset timer/i));

        // Change settings
        rerender(<PomodoroTimer {...defaultProps} focusTime={10} />);

        // Start again - progress should use new focusTime (10), not old (1)
        fireEvent.click(screen.getByLabelText(/start timer/i));
        act(() => jest.advanceTimersByTime(5000));

        // Progress bar should reflect 10 minute session (5s out of 600s ≈ 0.83%)
        const progressCircle = container.querySelector('circle[stroke="url(#progressGradient)"]');
        const circumference = 2 * Math.PI * 144;
        const expectedProgress = 0.83;
        const expectedDashoffset = circumference * (1 - expectedProgress / 100);

        const dashoffset = progressCircle?.getAttribute('stroke-dashoffset');
        expect(parseFloat(dashoffset || '0')).toBeCloseTo(expectedDashoffset, 0);
      });
    });

    describe('Skip button', () => {
      it('should switch from focus to break', () => {
        render(<PomodoroTimer {...defaultProps} focusTime={25} shortBreakTime={5} />);

        expect(screen.getByText(/focus/i)).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText(/skip session/i));

        expect(screen.getByText(/break/i)).toBeInTheDocument();
        expect(screen.getByText(/5:00/)).toBeInTheDocument();
      });

      it('should preserve running state when skipping', () => {
        render(<PomodoroTimer {...defaultProps} focusTime={1} shortBreakTime={1} />);

        // Start focus timer
        fireEvent.click(screen.getByLabelText(/start timer/i));

        // Skip to break
        fireEvent.click(screen.getByLabelText(/skip session/i));

        // Timer should still be running (counting down)
        act(() => jest.advanceTimersByTime(1000));
        expect(screen.getByText(/0:59/)).toBeInTheDocument();
      });

      it('should clear sessionStartFocusTime when skipping', () => {
        const { container, rerender } = render(
          <PomodoroTimer {...defaultProps} focusTime={1} />
        );

        // Start timer
        fireEvent.click(screen.getByLabelText(/start timer/i));
        act(() => jest.advanceTimersByTime(5000));

        // Change settings and skip to break
        rerender(<PomodoroTimer {...defaultProps} focusTime={10} shortBreakTime={5} />);
        fireEvent.click(screen.getByLabelText(/skip session/i));

        // Skip back to focus
        fireEvent.click(screen.getByLabelText(/skip session/i));

        // Progress should use new focusTime (10), not old (1)
        act(() => jest.advanceTimersByTime(5000));

        const progressCircle = container.querySelector('circle[stroke="url(#progressGradient)"]');
        const circumference = 2 * Math.PI * 144;
        const expectedProgress = 0.83; // 5s out of 600s
        const expectedDashoffset = circumference * (1 - expectedProgress / 100);

        const dashoffset = progressCircle?.getAttribute('stroke-dashoffset');
        expect(parseFloat(dashoffset || '0')).toBeCloseTo(expectedDashoffset, 0);
      });
    });

    describe('Start/Pause button', () => {
      it('should start timer when clicked', () => {
        render(<PomodoroTimer {...defaultProps} focusTime={25} />);

        fireEvent.click(screen.getByLabelText(/start timer/i));

        act(() => jest.advanceTimersByTime(1000));
        expect(screen.getByText(/24:59/)).toBeInTheDocument();
      });

      it('should pause timer when clicked while running', () => {
        render(<PomodoroTimer {...defaultProps} focusTime={25} />);

        // Start
        fireEvent.click(screen.getByLabelText(/start timer/i));
        act(() => jest.advanceTimersByTime(5000));

        expect(screen.getByText(/24:55/)).toBeInTheDocument();

        // Pause
        fireEvent.click(screen.getByLabelText(/pause timer/i));

        // Time should not advance
        act(() => jest.advanceTimersByTime(10000));
        expect(screen.getByText(/24:55/)).toBeInTheDocument();
      });

      it('should toggle between start and pause', () => {
        render(<PomodoroTimer {...defaultProps} focusTime={25} />);

        // Initially shows "Start"
        expect(screen.getByLabelText(/start timer/i)).toBeInTheDocument();

        // Click to start
        fireEvent.click(screen.getByLabelText(/start timer/i));

        // Should now show "Pause"
        expect(screen.getByLabelText(/pause timer/i)).toBeInTheDocument();

        // Click to pause
        fireEvent.click(screen.getByLabelText(/pause timer/i));

        // Should show "Start" again
        expect(screen.getByLabelText(/start timer/i)).toBeInTheDocument();
      });
    });
  });

  describe('Timestamp-Based Timing (Background Tab Accuracy)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(Date, 'now');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should set endTime when timer starts', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // endTime should be persisted to localStorage
      const savedData = localStorage.getItem('pomodoro-stats');
      expect(savedData).toBeTruthy();

      const parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBe(mockNow + (60 * 1000)); // 1 minute = 60 seconds
    });

    it('should calculate timeLeft from endTime on each tick', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Simulate time passing - 10 seconds
      (Date.now as jest.Mock).mockReturnValue(mockNow + 10000);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should show 50 seconds remaining
      expect(screen.getByText(/00:50/)).toBeInTheDocument();
    });

    it('should handle delayed/skipped ticks accurately', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Simulate 30 seconds passing in real time, but only 1 tick firing
      // (simulates heavy throttling in background tab)
      (Date.now as jest.Mock).mockReturnValue(mockNow + 30000);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still show accurate time (30 seconds remaining)
      expect(screen.getByText(/00:30/)).toBeInTheDocument();
    });

    it('should clear endTime when timer is paused', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Verify endTime is set
      let savedData = localStorage.getItem('pomodoro-stats');
      let parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBeTruthy();

      // Pause
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // endTime should be null when paused
      savedData = localStorage.getItem('pomodoro-stats');
      parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBeNull();
    });

    it('should set new endTime when resumed after pause', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      // Start
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Advance 10 seconds
      (Date.now as jest.Mock).mockReturnValue(mockNow + 10000);
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText(/00:50/)).toBeInTheDocument();

      // Pause
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Wait 5 seconds in "real time" (should not affect timer)
      (Date.now as jest.Mock).mockReturnValue(mockNow + 15000);

      // Resume
      const resumeButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(resumeButton);

      // New endTime should be current time + remaining time (50 seconds)
      const savedData = localStorage.getItem('pomodoro-stats');
      const parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBe((mockNow + 15000) + (50 * 1000));
    });

    it('should clear endTime on reset', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Verify endTime is set
      let savedData = localStorage.getItem('pomodoro-stats');
      let parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBeTruthy();

      // Reset
      const resetButton = screen.getByLabelText(/reset timer/i);
      fireEvent.click(resetButton);

      // endTime should be null
      savedData = localStorage.getItem('pomodoro-stats');
      parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBeNull();
    });

    it('should set new endTime when skipping while running', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      render(<PomodoroTimer {...defaultProps} focusTime={1} shortBreakTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Verify endTime is set for focus (1 min = 60 sec)
      let savedData = localStorage.getItem('pomodoro-stats');
      let parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBe(mockNow + 60000);

      // Skip to break (while running)
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // endTime should be set for the new break session (1 min = 60 sec)
      savedData = localStorage.getItem('pomodoro-stats');
      parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBe(mockNow + 60000);

      // Now pause the timer
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Skip while paused
      fireEvent.click(screen.getByLabelText(/skip session/i));

      // endTime should be null when skipped while paused
      savedData = localStorage.getItem('pomodoro-stats');
      parsed = JSON.parse(savedData!);
      expect(parsed.endTime).toBeNull();
    });

    it('should detect completion even with heavily delayed tick', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      const onPomodoroComplete = jest.fn();
      render(<PomodoroTimer {...defaultProps} focusTime={1} onPomodoroComplete={onPomodoroComplete} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Simulate time passing beyond completion (70 seconds instead of 60)
      (Date.now as jest.Mock).mockReturnValue(mockNow + 70000);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should have triggered completion
      expect(onPomodoroComplete).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('Page Visibility API (Tab Switching)', () => {
    let visibilityChangeEvent: Event;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(Date, 'now');
      visibilityChangeEvent = new Event('visibilitychange');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should immediately update timeLeft when tab becomes visible', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      // Mock visibility state as hidden initially
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible',
      });

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Simulate tab being hidden for 30 seconds
      (Date.now as jest.Mock).mockReturnValue(mockNow + 30000);
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
      });

      // No ticks fire while hidden (simulating background throttling)
      // Now tab becomes visible again
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
      });

      // Trigger visibility change event
      act(() => {
        document.dispatchEvent(visibilityChangeEvent);
      });

      // Should immediately show correct time (30 seconds remaining)
      expect(screen.getByText(/00:30/)).toBeInTheDocument();
    });

    it('should trigger completion if timer ended while tab was hidden', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible',
      });

      const onPomodoroComplete = jest.fn();
      render(<PomodoroTimer {...defaultProps} focusTime={1} onPomodoroComplete={onPomodoroComplete} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Simulate tab being hidden for 70 seconds (beyond completion)
      (Date.now as jest.Mock).mockReturnValue(mockNow + 70000);
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
      });

      // Tab becomes visible again
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
      });

      // Trigger visibility change event
      act(() => {
        document.dispatchEvent(visibilityChangeEvent);
      });

      // Allow next tick to process the completion
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should have triggered completion
      expect(onPomodoroComplete).toHaveBeenCalled();
    });

    it('should not update if timer is not running when tab becomes visible', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible',
      });

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      // Don't start timer

      // Simulate time passing and tab becoming visible
      (Date.now as jest.Mock).mockReturnValue(mockNow + 30000);

      act(() => {
        document.dispatchEvent(visibilityChangeEvent);
      });

      // Should still show full time (not affected by visibility change)
      expect(screen.getByText(/01:00/)).toBeInTheDocument();
    });

    it('should not update if endTime is null when tab becomes visible', () => {
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible',
      });

      render(<PomodoroTimer {...defaultProps} focusTime={1} />);

      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Pause timer (clears endTime)
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Advance time
      (Date.now as jest.Mock).mockReturnValue(mockNow + 30000);

      // Trigger visibility change
      act(() => {
        document.dispatchEvent(visibilityChangeEvent);
      });

      // Time should not have changed (still paused)
      expect(screen.getByText(/01:00/)).toBeInTheDocument();
    });
  });

  describe('Bug #3: Progress bar incorrect after skipping while paused then changing settings', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(Date, 'now');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should reset isPaused when skipping, allowing settings to sync timeLeft', () => {
      // This tests the bug where:
      // 1. Complete focus session -> auto-start break
      // 2. Pause break
      // 3. Skip to focus (isPaused should reset to false)
      // 4. Change focusTime -> timeLeft should update (was blocked by isPaused=true)

      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      const onPomodoroComplete = jest.fn();
      const { rerender } = render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={1}
          completedPomodoros={0}
          onPomodoroComplete={onPomodoroComplete}
        />
      );

      // Start timer
      const startButton = screen.getByLabelText(/start timer/i);
      fireEvent.click(startButton);

      // Complete the focus session (advance to 0)
      (Date.now as jest.Mock).mockReturnValue(mockNow + 60000); // 1 minute later
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now in break mode, timer auto-started
      expect(onPomodoroComplete).toHaveBeenCalledWith(1, 1);

      // Pause the break timer
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);

      // Skip back to focus
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);

      // Now change focusTime from 1 to 2 minutes
      rerender(
        <PomodoroTimer
          {...defaultProps}
          focusTime={2}
          shortBreakTime={1}
          completedPomodoros={1}
          onPomodoroComplete={onPomodoroComplete}
        />
      );

      // The timer should show 02:00, not 01:00
      // If isPaused wasn't reset, settings sync would be blocked and timeLeft would stay at 60
      expect(screen.getByText(/02:00/)).toBeInTheDocument();
    });

    it('should show 0% progress after skipping while paused and changing settings', () => {
      // More direct test: verify progress bar is at 0% (not 50% or 100%)
      const mockNow = 1000000000000;
      (Date.now as jest.Mock).mockReturnValue(mockNow);

      const onPomodoroComplete = jest.fn();
      const { container, rerender } = render(
        <PomodoroTimer
          {...defaultProps}
          focusTime={1}
          shortBreakTime={1}
          completedPomodoros={0}
          onPomodoroComplete={onPomodoroComplete}
        />
      );

      // Start and complete focus session
      fireEvent.click(screen.getByLabelText(/start timer/i));
      (Date.now as jest.Mock).mockReturnValue(mockNow + 60000);
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Pause break, skip to focus
      fireEvent.click(screen.getByLabelText(/pause timer/i));
      fireEvent.click(screen.getByLabelText(/skip session/i));

      // Change focusTime to 2 minutes
      rerender(
        <PomodoroTimer
          {...defaultProps}
          focusTime={2}
          shortBreakTime={1}
          completedPomodoros={1}
          onPomodoroComplete={onPomodoroComplete}
        />
      );

      // Check progress bar - should be at 0% (strokeDashoffset = circumference)
      const progressCircle = container.querySelector('circle[stroke="url(#progressGradient)"]');
      expect(progressCircle).toBeInTheDocument();

      const circumference = 2 * Math.PI * 144; // radius = 144
      const strokeDashoffset = progressCircle?.getAttribute('stroke-dashoffset');

      // At 0% progress, strokeDashoffset should equal circumference
      expect(parseFloat(strokeDashoffset || '0')).toBeCloseTo(circumference, 0);
    });
  });
});
