import React from 'react';
import { render, screen } from '@testing-library/react';
import MyTasks from './MyTasks';

describe('MyTasks Component', () => {
  it('renders loading state', () => {
    render(<MyTasks tasks={[]} loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders with tasks', () => {
    const tasks = [
      { id: '1', title: 'Task 1', dueDate: '2025-08-30', status: 'open' as const, priority: 'high' as const },
      { id: '2', title: 'Task 2', dueDate: null, status: 'in_progress' as const, priority: 'medium' as const },
    ];
    render(<MyTasks tasks={tasks} />);
    expect(screen.getByText(/task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/task 2/i)).toBeInTheDocument();
  });

  it('renders with no tasks message', () => {
    render(<MyTasks tasks={[]} />);
    expect(screen.getByText(/you’re all caught up/i)).toBeInTheDocument();
  });
});