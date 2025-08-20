import React from 'react';

interface Event {
  id: string;
  name: string;
  date: string;
  riskLevel: 'high' | 'medium' | 'low';
  owner: string;
}

interface DangerZoneProps {
  events: Event[];
  limit?: number;
  loading?: boolean;
}

const DangerZone: React.FC<DangerZoneProps> = ({ events, limit = 5, loading }) => {
  if (loading) {
    return <DangerZoneSkeleton />;
  }

  const sortedEvents = [...events].sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }).slice(0, limit);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Danger Zone">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h2>
      {sortedEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No at-risk events</p>
      ) : (
        <ul className="space-y-3" role="list" aria-live="polite">
          {sortedEvents.map(event => (
            <li key={event.id} className="border-l-4 border-gray-200 pl-4 hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.name}</p>
                  <div className="flex items-center mt-1 space-x-2 text-sm text-gray-600">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{event.owner}</span>
                  </div>
                </div>
                <span 
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeColor(event.riskLevel)}`}
                  role="status"
                  aria-label={`Risk level: ${event.riskLevel}`}
                >
                  {event.riskLevel.toUpperCase()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DangerZoneSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse" aria-hidden="true" aria-busy="true">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="border-l-4 border-gray-200 pl-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Object.assign(DangerZone, { Skeleton: DangerZoneSkeleton });