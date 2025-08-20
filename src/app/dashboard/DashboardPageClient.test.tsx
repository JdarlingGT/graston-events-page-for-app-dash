import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPageClient from './DashboardPageClient';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/dashboard-summary', ({ request, params, cookies }) => {
    return HttpResponse.json({
      metrics: {
        ytdRevenue: 5000000,
        atRiskEvents: 3,
        newRegistrationsThisMonth: 150,
      },
      atRiskEvents: [
        { id: '1', name: 'Event 1', date: '2025-08-25', riskLevel: 'high', owner: 'John Doe' },
        { id: '2', name: 'Event 2', date: '2025-08-26', riskLevel: 'medium', owner: 'Jane Smith' },
      ],
      tasks: [
        { id: '1', title: 'Task 1', dueDate: '2025-08-30', status: 'open', priority: 'high' },
        { id: '2', title: 'Task 2', dueDate: null, status: 'in_progress', priority: 'medium' },
      ],
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DashboardPageClient Integration Test', () => {
  it('renders skeletons first, then real content', async () => {
    render(<DashboardPageClient />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/ytd revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/at-risk events/i)).toBeInTheDocument();
      expect(screen.getByText(/new registrations/i)).toBeInTheDocument();
    });
  });
});