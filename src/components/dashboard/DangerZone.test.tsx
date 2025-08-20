import React from 'react';
import { render, screen } from '@testing-library/react';
import DangerZone from './DangerZone';

describe('DangerZone Component', () => {
  it('renders loading state', () => {
    render(<DangerZone events={[]} loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders with events', () => {
    const events = [
      { id: '1', name: 'Event 1', date: '2025-08-25', riskLevel: 'high' as 'high', owner: 'John Doe' },
      { id: '2', name: 'Event 2', date: '2025-08-26', riskLevel: 'medium' as 'medium', owner: 'Jane Smith' },
    ];
    render(<DangerZone events={events} />);
    expect(screen.getByText(/event 1/i)).toBeInTheDocument();
    expect(screen.getByText(/event 2/i)).toBeInTheDocument();
  });

  it('renders with no events message', () => {
    render(<DangerZone events={[]} />);
    expect(screen.getByText(/no at-risk events/i)).toBeInTheDocument();
  });
});