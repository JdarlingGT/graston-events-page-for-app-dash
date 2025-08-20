import React, { createContext, useContext } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface DashboardData {
  metrics: {
    ytdRevenue: number;
    atRiskEvents: number;
    newRegistrationsThisMonth: number;
  };
  atRiskEvents: Array<{
    id: string;
    name: string;
    date: string;
    riskLevel: 'high' | 'medium' | 'low';
    owner: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    status: 'open' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high';
  }>;
}

interface DashboardDataContextProps {
  data: DashboardData | undefined;
  isLoading: boolean;
  isError: boolean;
  refresh: () => void;
}

const DashboardDataContext = createContext<DashboardDataContextProps | undefined>(undefined);

export const DashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, error, mutate } = useSWR<DashboardData>('/api/dashboard-summary', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 1000 * 30,
  });

  const isLoading = !data && !error;
  const isError = !!error;

  return (
    <DashboardDataContext.Provider value={{ data, isLoading, isError, refresh: mutate }}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
};