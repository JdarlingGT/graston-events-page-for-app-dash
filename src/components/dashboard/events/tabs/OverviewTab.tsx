'use client';

import React from 'react';
import { EventData } from '../types';
import { Calendar } from 'lucide-react';

interface OverviewTabProps {
  event: EventData;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ event }) => {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-4">Event Timeline</h2>
        <div className="space-y-4">
          {event.schedule.schedule.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Day {item.day}</div>
                <div className="text-sm text-gray-600">
                  {item.startTime} - {item.endTime}
                </div>
                <div className="mt-1 text-sm">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Materials</h3>
          <ul className="list-disc list-inside space-y-1">
            {event.content.materials.map((material, index) => (
              <li key={index} className="text-sm">{material}</li>
            ))}
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Prerequisites</h3>
          <ul className="list-disc list-inside space-y-1">
            {event.content.prerequisites.map((prerequisite, index) => (
              <li key={index} className="text-sm">{prerequisite}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Learning Objectives</h3>
        <ul className="list-disc list-inside space-y-1">
          {event.content.objectives.map((objective, index) => (
            <li key={index} className="text-sm">{objective}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverviewTab;