"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Save } from "lucide-react";
import { toast } from "sonner";

interface CommunicationsPanelProps {
  eventId: string;
}

export function CommunicationsPanel({ eventId }: CommunicationsPanelProps) {
  const [notes, setNotes] = useState("");

  const handleSendSequence = async () => {
    toast.info("Sending email sequence...");
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("'Last Call' email sequence sent to interested leads.");
  };

  const handleSaveNotes = () => {
    // In a real app, you would save this to your backend
    toast.success("Notes saved successfully!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Email Automation</CardTitle>
          <CardDescription>
            Trigger email sequences in FluentCRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send a targeted email campaign to a list of leads who have shown interest in this event but have not yet enrolled.
          </p>
          <Button onClick={handleSendSequence} className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Send 'Last Call' Sequence
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}