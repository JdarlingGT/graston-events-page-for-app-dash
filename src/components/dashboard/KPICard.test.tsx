import React from 'react';
import { render, screen } from '@testing-library/react';
import KPICard from './KPICard';

describe('KPICard Component', () => {
  it('renders loading state', () => {
    render(<KPICard title="Test KPI" value={0} loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders with title and value', () => {
    render(<KPICard title="Test KPI" value={100} />);
    expect(screen.getByText(/test kpi/i)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('renders with subtitle and icon', () => {
    render(<KPICard title="Test KPI" value={100} subtitle="Subtitle" icon={<span>Icon</span>} />);
    expect(screen.getByText(/subtitle/i)).toBeInTheDocument();
    expect(screen.getByText(/icon/i)).toBeInTheDocument();
  });

  it('renders trend information', () => {
    render(<KPICard title="Test KPI" value={100} trend={{ delta: 5, direction: 'up' }} />);
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });
});