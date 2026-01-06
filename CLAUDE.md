# Claude Code Onboarding: Pomodoro Timer & Task Tracker

> **Collaboration Note**: This is a starter document. I (the human) will work with you (the LLM) collaboratively—providing additional guidance in prompts as needed. We can edit this document together as we go. Don't hesitate to ask clarifying questions if something is unclear.

## Project Overview

A Pomodoro timer and task tracker built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Uses Jest + React Testing Library for testing.

**Location**: `/Users/frederickpukay/GitHub/public/pomodoro-timer-and-task-tracker`

**Design Assets**: The `design_docs/` folder contains design mockups and UI specifications that may be referenced during feature implementation. The human may provide additional clarifications or iterate on the implementation plan as needed.

---

## Project Status

**✅ Step 1 Complete**: Core Timer Functionality & Storage (implementation done, tests deferred to Step 6)

**➡️ Current Step**: Ready to begin Step 2 (Tasks/Subtasks with Priority) when indicated

### Step 1 Todos (Implemented - Tests Deferred to Step 6)

The following features were implemented in Step 1 but did not follow TDD. Tests will be added in **Step 6: Testing & Bug Fixes**:

1. ✅ Fix button behaviors and break timing (Reset, Skip, long break after 4 pomodoros)
2. ✅ Implement localStorage split (settings, stats, completed)
3. ✅ Settings lock when timer running (disable inputs only)
4. ✅ Add reset button to Completed section with dialog
5. ✅ Add reset button to Settings section with dialog
6. ✅ Fix timer display sync when settings change
7. ✅ Add sound on pomodoro completion
8. ✅ Remove 'Time in mins' and reposition saved messages for better UI
9. ✅ Add outer progress bar with Option 8 gradient (clockwise from top)
10. ✅ Add inner pomodoro circles with clock sweep animation
11. ✅ Fix pomodoro circles to persist through long break and reset at start of next focus session

**Note**: Some basic tests exist for bugs #1 (progress bar during paused session) and #2 (circle display logic), but comprehensive test coverage will be added in Step 6.

---

## Project Structure

```
src/
├── app/
│   └── page.tsx              # Main page (orchestrates components)
├── components/
│   ├── PomodoroTimer.tsx     # Core timer with state management (424 lines)
│   ├── Settings.tsx          # Timer settings panel
│   ├── Completed.tsx         # Completion stats display
│   ├── Tasks.tsx             # Task management
│   ├── TaskItem.tsx          # Individual task rendering
│   └── __tests__/            # Component tests
├── hooks/
│   ├── useTasks.ts           # Task management hook
│   └── __tests__/
├── lib/storage/
│   ├── pomodoroStorage.ts    # Pomodoro-specific storage (3 buckets)
│   ├── localStorage.ts       # Task storage adapter
│   └── __tests__/
└── types/
    └── task.ts               # TypeScript interfaces
```

---

## Key Technical Details

### localStorage Architecture (3 Buckets)

```typescript
// Settings bucket: pomodoro-settings
interface PomodoroSettings {
  focusTime: number;        // Default: 25
  shortBreakTime: number;   // Default: 5
  longBreakTime: number;    // Default: 30
}

// Stats bucket: pomodoro-stats
interface PomodoroStats {
  isRunning: boolean;
  isFocusSession: boolean;
  timeLeft: number;
  isPaused: boolean;
  sessionStartFocusTime: number | null;  // Tracks initial focus commitment
}

// Completed bucket: pomodoro-completed
interface CompletedStats {
  completedPomodoros: number;
  totalFocusMinutes: number;
}
```

**Key Design Decision**: `isRunning` and `isPaused` are NEVER restored from localStorage - always start fresh.

### Timer Logic Complexity

1. **sessionStartFocusTime**: When user starts focus session, captures the focus time they committed to. If they change settings mid-session, progress bars use the original commitment, not the new value.

2. **Long Break Logic**: Only triggers after 4th, 8th, 12th pomodoro:
   ```typescript
   completedPomodoros > 0 && completedPomodoros % 4 === 0
   ```

3. **Circle Display Logic**: Shows 4 circles filled during long break, resets when new focus session starts:
   ```typescript
   const pomodoroInSet = (completedPomodoros % 4 === 0 && completedPomodoros > 0 && !isFocusSession)
     ? 4
     : completedPomodoros % 4;
   ```

4. **Button Behaviors**:
   - **Reset**: Stops timer, clears `sessionStartFocusTime`, resets to current mode's time
   - **Skip**: Switches mode (focus↔break), clears `sessionStartFocusTime`, preserves running state
   - **Start/Pause**: Toggles `isRunning`, sets `isPaused` appropriately

---

## Existing Test Patterns

### Test Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'

class LocalStorageMock {
  constructor() { this.store = {}; }
  clear() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
}

global.localStorage = new LocalStorageMock();
```

### Component Test Pattern (`PomodoroTimer.test.tsx`)
```typescript
import { render, screen, fireEvent, act } from '@testing-library/react';
import PomodoroTimer from '../PomodoroTimer';

describe('PomodoroTimer Component', () => {
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

  it('should do something', () => {
    const { container } = render(<PomodoroTimer {...defaultProps} />);

    // Find button by aria-label
    const startButton = screen.getByLabelText(/start timer/i);
    fireEvent.click(startButton);

    // Advance time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Assert
    expect(screen.getByText(/something/)).toBeInTheDocument();
  });
});
```

### Storage Test Pattern (`pomodoroStorage.test.ts`)
```typescript
import { saveSettings, loadSettings, ... } from '../pomodoroStorage';

describe('Pomodoro Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load settings', () => {
    const settings = { focusTime: 30, shortBreakTime: 10, longBreakTime: 45 };
    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });
});
```

---

## Test Commands

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

---

## Coding Standards

- **TypeScript**: Strict mode enabled
- **Testing**: Use `@testing-library/react` and `@testing-library/user-event`
- **Timer Tests**: Always use `jest.useFakeTimers()` and `act()` for time advancement
- **Accessibility**: Use `aria-label` for button queries in tests
- **Storage Tests**: Always `localStorage.clear()` in `beforeEach`

---

## Test Priority Guide

### High Priority (Core Logic)
1. **pomodoroStorage.ts** - All CRUD operations for the 3 buckets
2. **Long break logic** - Triggers correctly after 4 pomodoros
3. **Reset button** - Clears session, keeps mode, resets time
4. **Skip button** - Switches mode, clears session, preserves running state

### Medium Priority (Integration)
5. **Settings inputs disabled** when timer is running
6. **Timer sync** - Updates display when settings change (only when stopped)
7. **Circle persistence** - Shows 4 filled during long break, resets on new focus

### Lower Priority (Visual/Audio)
8. **Progress bar calculations** (already have some tests)
9. **Sound playback** (hard to test, may skip)

---

## Suggested Test File Structure

```
src/lib/storage/__tests__/
├── pomodoroStorage.test.ts    # ← Needs expansion (3-bucket tests)

src/components/__tests__/
├── PomodoroTimer.test.tsx     # ← Needs expansion (button behaviors, long break)
├── Settings.test.tsx          # ← New file (disabled inputs, reset dialog)
├── Completed.test.tsx         # ← New file (reset dialog)
```

---

## Notes for Testing

1. **Don't test sound**: Web Audio API is hard to mock and low value

2. **Focus on state transitions**: The complex parts are:
   - Focus → Break transitions
   - 4-pomodoro cycle for long breaks
   - sessionStartFocusTime preservation

3. **Use aria-labels for queries**: Buttons have clear aria-labels:
   - `aria-label="Start timer"` / `"Pause timer"`
   - `aria-label="Reset timer"`
   - `aria-label="Skip session"`

4. **SVG testing**: Use `container.querySelector()` for SVG elements:
   ```typescript
   const progressCircle = container.querySelector('circle[stroke="url(#progressGradient)"]');
   ```

---

## Quick Reference: File Paths

| File | Path |
|------|------|
| Main timer component | `src/components/PomodoroTimer.tsx` |
| Storage functions | `src/lib/storage/pomodoroStorage.ts` |
| Existing timer tests | `src/components/__tests__/PomodoroTimer.test.tsx` |
| Jest setup | `jest.setup.js` |
| Settings component | `src/components/Settings.tsx` |
| Completed component | `src/components/Completed.tsx` |
| Implementation plan | `implementation-plan.html` |

---

## Remaining Implementation Steps

See `implementation-plan.html` for detailed requirements. The human will provide more specific guidance when we reach each step.

### Step 2: Tasks/Subtasks with Priority
- Add priority slider (valid values: 1, 2, 3, 4, 6, 9)
- Priority badge display (e.g., "Priority: High Impact • Low Time")
- Preserve existing UI (accordion, drag handles, checkboxes)
- Task auto-completion logic
- localStorage integration with priorities

### Step 3: Header & Analytics UI
- Header redesign with feedback icon
- Analytics bar below header showing:
  - Total site visits
  - Total tasks completed
  - Total pomodoros completed
- UI only - display stats from localStorage (no PostHog yet)
- 100% responsive design

### Step 4: New Day Banner
- Detect when user returns after midnight
- Display welcome banner with last session stats
- Two options: "Fresh Start" (reset stats) or "Keep Stats"
- Banner with ☀️ emoji and gradient styling

### Step 5: Final Styling & Polish
- Comprehensive styling consistency pass
- Color, typography, spacing consistency
- Responsive behavior across all breakpoints
- Cross-browser testing
- Accessibility improvements (ARIA, keyboard nav, focus states)

### Step 6: Testing & Bug Fixes
- **FIRST**: Add comprehensive tests for Step 1 features (the 11 todos listed above)
- **THEN**: Address outstanding bugs:
  - Browser refresh flicker investigation
  - Any bugs discovered in Steps 1-5
  - Performance optimization
  - Edge case handling

### Step 7: PostHog Integration
- Install and configure PostHog SDK
- Track: site visits, tasks/pomodoros completed, banner interactions, share clicks
- Display real-time stats in analytics bar
- Public/private dashboard decision

### Step 8: Hosting & Deployment
- Deploy to Vercel (recommended)
- Configure CI/CD pipeline
- Set up environment variables
- Custom domain (optional)
- Production smoke testing

---

## Development Approach: Test-Driven Development (TDD)

### Core Principle: Small, Atomic Tasks

**CRITICAL**: Each step is broken down into **small, manageable tasks**. Each task is for **ONE thing only**:
- ✅ One feature (e.g., "Add priority slider to task card")
- ✅ One bug fix (e.g., "Fix timer sync when settings change while paused")
- ❌ NOT multiple features in one task
- ❌ NOT mixing features and bug fixes

**Why?** This follows [Addy Osmani's LLM coding workflow recommendations](https://addyo.substack.com/p/my-llm-coding-workflow-going-into): smaller tasks = better LLM performance, easier debugging, clearer commits.

**Who breaks down the tasks?** The human will provide task breakdown and clarification as needed. The implementation plan hints at potential tasks, but expect further guidance during each step.

### TDD Workflow (Applied to Each Small Task)

When building each small task, follow this TDD workflow:

```
1. WRITE TESTS FIRST (RED)
   ↓
2. WRITE CODE TO PASS TESTS (GREEN)
   ↓
3. REFACTOR IF NEEDED
   ↓
4. I (HUMAN) MANUALLY TEST
```

**For each small task:**
1. **Write failing tests first** - Define what the code should do before writing it
2. **Run tests** - Confirm they fail (RED phase)
3. **Write implementation code** - Make the tests pass (GREEN phase)
4. **Run tests again** - Confirm all tests pass
5. **Refactor** - Clean up code while keeping tests green
6. **I will manually test** - Verify in browser before moving on

**When to apply TDD:**
- New features (Steps 2-4, 7) - each small feature task gets its own TDD cycle
- Bug fixes (Step 6) - each bug fix gets its own TDD cycle
- Any logic that can be meaningfully tested

**When TDD may not apply:**
- Pure styling changes (Step 5)
- Configuration/deployment (Step 8)
- Visual elements that are hard to test programmatically

**Note**: Step 1 did NOT follow TDD (implementation came first). Tests for Step 1 features will be added retroactively in Step 6.

---

## How to Proceed After Each Task

**Remember**: We work in **small, atomic tasks** - one feature OR one bug fix at a time.

**For each small task:**
1. **Write tests first** (when applicable) - Tests should fail initially
2. **Write implementation code** - Make the tests pass
3. **Run all tests**: `npm test` - Ensure nothing is broken
4. **Report completion** - Tell the human what you completed and wait for confirmation
5. **Human manually tests** - The human will test in browser and indicate task completion
6. **Human commits** - Only the human makes git commits (NOT Claude Code)
7. **Next task** - Human provides the next task or confirms when to move to the next step

**⚠️ IMPORTANT**: After generating new code for features or bug fixes, **ONLY the human indicates when a task is completed**. Do not assume completion or move on to the next task without explicit confirmation.

---

## Git Workflow

**⚠️ CRITICAL: Claude Code does NOT make commits.**

- **ONLY the human makes git commits**
- Claude Code writes/edits code, runs tests, but never commits
- After each task is complete and manually tested, the human will commit
- This ensures the human maintains full control over the git history and commit messages

---

## Resources

| Resource | Location |
|----------|----------|
| Implementation plan (detailed) | `implementation-plan.html` |
| Design mockups | Various HTML files in project root, `design_docs/` folder |
| Commit history | `git log --oneline` for context on recent changes |
| Project status | This file (CLAUDE.md) - "Project Status" section |
