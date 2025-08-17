"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  date: string;
  city: string;
}

interface PromoteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  instructorName: string;
}

export function PromoteEventModal({ isOpen, onClose, event, instructorName }: PromoteEventModalProps) {
  if (!event) return null;

  const eventDate = new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const eventUrl = `https://example.com/events/${event.id}`;

  const content = {
    linkedin: `I'm excited to announce that I will be teaching "${event.name}" in ${event.city} on ${eventDate}. This is a fantastic opportunity for professionals to deepen their skills. I'm looking forward to sharing my expertise and connecting with attendees. Learn more and register here: ${eventUrl}\n\n#ProfessionalDevelopment #Training #${event.city.replace(/\s/g, '')} #${instructorName.split(' ').join('')}`,
    twitter: `Join me in ${event.city} on ${eventDate} where I'll be teaching "${event.name}"! Ready to level up your skills? Register now: ${eventUrl}\n\n#Training #${event.city.replace(/\s/g, '')}`,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Promote Event: {event.name}</DialogTitle>
          <DialogDescription>
            Copy the text below to share on your social media channels.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="linkedin">
          <TabsList>
            <TabsTrigger value="linkedin">LinkedIn / Facebook</TabsTrigger>
            <TabsTrigger value="twitter">Twitter / X</TabsTrigger>
          </TabsList>
          <TabsContent value="linkedin">
            <Textarea readOnly value={content.linkedin} rows={10} />
            <Button className="mt-2" onClick={() => handleCopy(content.linkedin)}>
              <Copy className="mr-2 h-4 w-4" /> Copy Text
            </Button>
          </TabsContent>
          <TabsContent value="twitter">
            <Textarea readOnly value={content.twitter} rows={6} />
            <Button className="mt-2" onClick={() => handleCopy(content.twitter)}>
              <Copy className="mr-2 h-4 w-4" /> Copy Text
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}