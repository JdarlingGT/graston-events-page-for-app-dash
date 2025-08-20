'use client';

import React from 'react';
import { DashboardDataProvider, useDashboardData } from '../../components/dashboard/DashboardDataProvider';
import KPICard from '../../components/dashboard/KPICard';
import DangerZone from '../../components/dashboard/DangerZone';
import MyTasks from '../../components/dashboard/MyTasks';

const DashboardPageClient: React.FC = () => {
  return (
    <DashboardDataProvider>
      <DashboardContent />
    </DashboardDataProvider>
  );
};

const DashboardContent: React.FC = () => {
  const { data, isLoading, isError, refresh } = useDashboardData();

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard data</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            aria-label="Retry loading dashboard data"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Format currency with locale
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Skip to main content is handled by PageShell */}
      
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Key Performance Indicators">
        <KPICard 
          title="YTD Revenue" 
          value={isLoading || !data ? '...' : formatCurrency(data.metrics.ytdRevenue)}
          loading={isLoading}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard 
          title="At-Risk Events" 
          value={isLoading || !data ? '...' : data.metrics.atRiskEvents.toString()}
          loading={isLoading}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <KPICard 
          title="New Registrations This Month" 
          value={isLoading || !data ? '...' : data.metrics.newRegistrationsThisMonth.toString()}
          loading={isLoading}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DangerZone 
          events={data?.atRiskEvents || []}
          loading={isLoading}
          limit={5}
        />
        <MyTasks 
          tasks={data?.tasks || []}
          loading={isLoading}
          showCompleted={false}
        />
      </div>
    </div>
  );
};

export default DashboardPageClient;