"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Send, User, Building, History } from "lucide-react";
import { toast } from "sonner";
import { Provider } from "@/lib/mock-data";

interface OutreachCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  event: { id: string; name: string } | null;
}

export function OutreachCopilotModal({ isOpen, onClose, provider, event }: OutreachCopilotModalProps) {
  const [email, setEmail] = useState({ subject: "", body: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && provider && event) {
      const generateEmail = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/sales/outreach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ providerId: provider.id, eventId: event.id }),
          });
          if (!response.ok) throw new Error('Failed to generate email');
          const data = await response.json();
          setEmail(data);
        } catch (error) {
          toast.error("AI failed to generate email draft.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      generateEmail();
    }
  }, [isOpen, provider, event, onClose]);

  const handleSend = async () => {
    setIsSending(true);
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Email sent to ${provider?.name}`);
    setIsSending(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl grid-cols-3">
        <div className="col-span-1 border-r pr-6">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {provider && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{provider.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{provider.city}, {provider.state}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Training History
                </div>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {provider.trainingHistory.length > 0 ? (
                    provider.trainingHistory.map(h => <li key={h.eventId}>{h.eventName}</li>)
                  ) : (
                    <li>No prior training</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI Outreach Co-Pilot
            </DialogTitle>
            <DialogDescription>
              Review and edit the AI-generated email draft for {provider?.name}.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={email.subject}
                  onChange={(e) => setEmail(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={email.body}
                  onChange={(e) => setEmail(prev => ({ ...prev, body: e.target.value }))}
                  rows={12}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSend} disabled={isLoading || isSending}>
              <Send className="mr-2 h-4 w-4" />
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}