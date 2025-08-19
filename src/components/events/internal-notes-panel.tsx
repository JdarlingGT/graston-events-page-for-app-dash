'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export function InternalNotesPanel() {
  const [notes, setNotes] = useState('');

  const handleSaveNotes = () => {
    toast.success('Notes saved successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal Staff Notes</CardTitle>
        <CardDescription>
          Share notes and updates with your team. This is not visible to students.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type your notes here..."
          rows={10}
        />
        <div className="flex justify-end">
          <Button onClick={handleSaveNotes}>
            <Save className="mr-2 h-4 w-4" />
            Save Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}