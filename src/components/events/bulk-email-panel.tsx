'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface BulkEmailPanelProps {
  attendeeCount: number;
}

export function BulkEmailPanel({ attendeeCount }: BulkEmailPanelProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSendEmail = async () => {
    if (!subject || !body) {
      toast.error('Subject and body are required.');
      return;
    }
    toast.info(`Sending email to ${attendeeCount} attendees...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Bulk email sent successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Email to Attendees</CardTitle>
        <CardDescription>
          Send an email to all enrolled attendees for this event.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message here..."
            rows={10}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send to {attendeeCount} Attendees
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}