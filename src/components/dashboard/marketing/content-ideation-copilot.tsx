'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface ContentIdea {
  type: string;
  content: string;
}

export function ContentIdeationCopilot() {
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);

  const mutation = useMutation({
    mutationFn: async (newTopic: string) => {
      const response = await fetch(`/api/marketing/generate-content-ideas?topic=${encodeURIComponent(newTopic)}`);
      if (!response.ok) {
throw new Error('Failed to generate ideas');
}
      return response.json();
    },
    onSuccess: (data) => {
      setIdeas(data);
    },
    onError: () => {
      toast.error('AI Co-pilot failed to generate ideas.');
    },
  });

  const handleGenerate = () => {
    if (topic.trim()) {
      mutation.mutate(topic);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Content Co-Pilot
        </CardTitle>
        <CardDescription>
          Brainstorm marketing ideas with AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter a topic, e.g., 'Advanced Training'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={mutation.isPending}>
            Generate
          </Button>
        </div>
        <div className="space-y-3 pt-2">
          {mutation.isPending ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : ideas.length > 0 ? (
            ideas.map((idea, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                <Lightbulb className="h-5 w-5 mt-1 text-yellow-500" />
                <div>
                  <p className="font-semibold text-sm">{idea.type}</p>
                  <p className="text-sm text-muted-foreground">{idea.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-6">
              Enter a topic to generate marketing ideas.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}