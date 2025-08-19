'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ContentCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  eventName: string;
}

const aiGeneratedContent: { [key: string]: string } = {
  professional: `Join us for an exclusive professional development opportunity: "{eventName}". 

This advanced workshop is designed for industry leaders looking to deepen their expertise and network with peers. 

Key takeaways include [Benefit 1], [Benefit 2], and [Benefit 3]. Limited seats are available to ensure a high-impact learning environment.

Register today to secure your place. #ProfessionalDevelopment #AdvancedTraining #{EventHashtag}`,
  engaging: `Ready to level up your skills? ✨ Don't miss out on "{eventName}"!

We're bringing together top experts for an interactive, hands-on workshop that will change the way you approach [Topic]. Whether you're looking to master new techniques or connect with fellow innovators, this is the event for you.

Seats are filling up fast! Tag a colleague who needs to be here 👇

#Skills #Workshop #{EventHashtag} #Learning`,
};

export function ContentCopilotModal({
  isOpen,
  onClose,
  onSave,
  eventName,
}: ContentCopilotModalProps) {
  const [tone, setTone] = useState('professional');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      const template = aiGeneratedContent[tone] || aiGeneratedContent.professional;
      setContent(template.replace(/{eventName}/g, eventName));
      setIsLoading(false);
    }, 1000);
  };

  const handleSave = () => {
    onSave(content);
    toast.success('Social media content saved!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Content Co-Pilot
          </DialogTitle>
          <DialogDescription>
            Generate initial social media posts for "{eventName}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tone" className="text-right">
              Tone
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional for LinkedIn</SelectItem>
                <SelectItem value="engaging">Engaging for Facebook/Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="AI-generated content will appear here. You can edit it before saving."
            rows={12}
            className="mt-4"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content}>
            Use This Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}