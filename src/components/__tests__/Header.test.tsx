import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header Component', () => {
  beforeEach(() => {
    // Mock fetch for analytics
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ visits: 0, shares: 0, pomodoros: 0 }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the app title', () => {
    render(<Header />);
    expect(screen.getByText('Pomodoro Timer & Task Tracker')).toBeInTheDocument();
  });

  it('should render the feedback button', () => {
    render(<Header />);
    const feedbackButton = screen.getByLabelText(/submit feedback/i);
    expect(feedbackButton).toBeInTheDocument();
  });

  it('should NOT render share section', () => {
    render(<Header />);
    // Share heading should not exist
    expect(screen.queryByText('SHARE')).not.toBeInTheDocument();
  });

  it('should NOT render email share button', () => {
    render(<Header />);
    expect(screen.queryByLabelText(/share via email/i)).not.toBeInTheDocument();
  });

  it('should NOT render X (Twitter) share button', () => {
    render(<Header />);
    expect(screen.queryByLabelText(/share on x \(twitter\)/i)).not.toBeInTheDocument();
  });

  it('should NOT render Facebook share button', () => {
    render(<Header />);
    expect(screen.queryByLabelText(/share on facebook/i)).not.toBeInTheDocument();
  });

  it('should NOT render Reddit share button', () => {
    render(<Header />);
    expect(screen.queryByLabelText(/share on reddit/i)).not.toBeInTheDocument();
  });

  it('should NOT render analytics stats (visits)', () => {
    render(<Header />);
    expect(screen.queryByText('visits')).not.toBeInTheDocument();
  });

  it('should NOT render analytics stats (shares)', () => {
    render(<Header />);
    expect(screen.queryByText('shares')).not.toBeInTheDocument();
  });

  it('should NOT render analytics stats (pomodoros)', () => {
    render(<Header />);
    expect(screen.queryByText('pomodoros')).not.toBeInTheDocument();
  });
});
