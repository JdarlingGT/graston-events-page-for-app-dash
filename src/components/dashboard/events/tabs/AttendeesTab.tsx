'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../ui/button';
import { Progress } from '../../../ui/progress';
import { CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { EventData } from '../types';

interface Attendee {
  id: string;
  name: string;
  email: string;
  checkedIn: boolean;
  courseProgress?: number;
  licenseType?: string;
  crmTags?: string[];
}

interface AttendeesTabProps {
  event: EventData;
}

const AttendeesTab: React.FC<AttendeesTabProps> = ({ event }) => {
  const [checkInMode, setCheckInMode] = React.useState(false);

  const { data: attendees = [], isLoading } = useQuery<Attendee[]>({
    queryKey: ['event-attendees', event.id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/attendees`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendees');
      }
      return response.json();
    },
  });

  const handleCheckIn = async (attendeeId: string) => {
    try {
      const response = await fetch(`/api/events/${event.id}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendeeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to check in attendee');
      }

      // In a real app, we would invalidate the attendees query here
    } catch (error) {
      console.error('Error checking in attendee:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Attendees</h2>
          <p className="text-sm text-gray-600">
            {attendees.length} registered, {attendees.filter(a => a.checkedIn).length} checked in
          </p>
        </div>
        <Button
          variant={checkInMode ? 'default' : 'outline'}
          onClick={() => setCheckInMode(!checkInMode)}
          className="flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          {checkInMode ? 'Exit Check-in Mode' : 'Enter Check-in Mode'}
        </Button>
      </div>

      <div className="border rounded-lg divide-y">
        {attendees.map(attendee => (
          <div
            key={attendee.id}
            className={`p-4 flex items-center justify-between ${
              checkInMode ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => checkInMode && handleCheckIn(attendee.id)}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{attendee.name}</span>
                {attendee.checkedIn && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className="text-sm text-gray-600">{attendee.email}</div>
              {attendee.courseProgress !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">Course Progress:</div>
                  <div className="w-32">
                    <Progress value={attendee.courseProgress} />
                  </div>
                  <div className="text-sm">{attendee.courseProgress}%</div>
                </div>
              )}
            </div>

            <div className="text-right">
              {attendee.licenseType && (
                <div className="text-sm text-gray-600 mb-1">
                  License: {attendee.licenseType}
                </div>
              )}
              {attendee.crmTags && attendee.crmTags.length > 0 && (
                <div className="flex gap-1">
                  {attendee.crmTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendeesTab;