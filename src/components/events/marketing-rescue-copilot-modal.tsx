'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketingRescueCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const initialMessages: Message[] = [
  {
    sender: 'ai',
    text: "Hello! I'm the Marketing Rescue Co-Pilot. This event is currently at risk. How can I help you formulate a rescue plan?",
  },
];

const aiResponses: { [key: string]: string } = {
  default: "That's an interesting question. Based on the data, here are three creative marketing angles we could take:\n\n1. **'Last Chance for Mastery':** Focus on the skills gap this course fills.\n2. **'The Community Advantage':** Highlight the networking opportunities with other professionals.\n3. **'Instructor Spotlight':** Create content around the instructor's unique expertise and experience.",
  options: "We have several options. We can launch a targeted email campaign to past attendees of similar courses, run a limited-time 'flash sale' on social media, or create a partnership with a local professional organization to promote the event.",
};

export function MarketingRescueCopilotModal({
  isOpen,
  onClose,
  eventName,
}: MarketingRescueCopilotModalProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) {
return;
}

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responseKey = inputValue.toLowerCase().includes('options') ? 'options' : 'default';
      const aiMessage: Message = { sender: 'ai', text: aiResponses[responseKey] };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Marketing Rescue Co-Pilot
          </DialogTitle>
          <DialogDescription>
            AI-powered assistance for the event: "{eventName}"
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.sender === 'user' && 'justify-end',
                  )}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="bg-primary text-primary-foreground">
                      <AvatarFallback>
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-md whitespace-pre-wrap',
                      message.sender === 'ai'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground',
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                   <Avatar className="bg-primary text-primary-foreground">
                      <AvatarFallback>
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask for marketing angles, email copy, or campaign ideas..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 right-1.5 transform -translate-y-1/2 h-7 w-7"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}