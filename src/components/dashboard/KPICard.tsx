import React from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { delta: number; direction: 'up' | 'down' | 'flat' };
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend, loading }) => {
  if (loading) {
    return <KPICardSkeleton />;
  }

  const trendColor = trend?.direction === 'up' ? 'text-green-600' : trend?.direction === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend?.direction === 'up' ? '↑' : trend?.direction === 'down' ? '↓' : '→';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" role="region" aria-label={title}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-medium text-gray-600 mb-1">{title}</h2>
          <p className="text-2xl font-bold text-gray-900" aria-live="polite">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 ${trendColor}`} aria-label={`Trend: ${trend.direction} ${trend.delta}%`}>
              <span className="mr-1">{trendIcon}</span>
              <span className="text-sm font-medium">{Math.abs(trend.delta)}%</span>
            </div>
          )}
        </div>
        {icon && <div className="ml-4 text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};

const KPICardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse" aria-hidden="true" aria-busy="true">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-32 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-20 mt-2"></div>
      </div>
      <div className="ml-4 h-8 w-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default Object.assign(KPICard, { Skeleton: KPICardSkeleton });