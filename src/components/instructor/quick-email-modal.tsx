'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Send, 
  Users, 
  Clock, 
  FileText, 
  Zap,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentEmails: string[];
  eventName?: string;
  instructorName?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'welcome' | 'reminder' | 'followup' | 'announcement';
  variables: string[];
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome to Training',
    subject: 'Welcome to {{eventName}} - Important Information',
    body: `Dear {{studentName}},

Welcome to {{eventName}}! We're excited to have you join us for this comprehensive training experience.

**Event Details:**
- Date: {{eventDate}}
- Time: {{eventTime}}
- Location: {{eventLocation}}
- Instructor: {{instructorName}}

**What to Bring:**
- Photo ID for check-in
- Comfortable clothing for practical sessions
- Notebook and pen for taking notes

**Pre-Course Preparation:**
Please complete your pre-course materials before the event. You can access them through your student portal.

If you have any questions, please don't hesitate to reach out.

Looking forward to seeing you soon!

Best regards,
{{instructorName}}`,
    category: 'welcome',
    variables: ['studentName', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'instructorName'],
  },
  {
    id: 'reminder',
    name: 'Event Reminder',
    subject: 'Reminder: {{eventName}} starts tomorrow',
    body: `Hi {{studentName}},

This is a friendly reminder that {{eventName}} starts tomorrow!

**Quick Details:**
- Date: {{eventDate}}
- Time: {{eventTime}}
- Location: {{eventLocation}}

**Don't Forget:**
- Arrive 15 minutes early for check-in
- Bring your photo ID
- Complete any remaining pre-course work

We're looking forward to an excellent training session with you!

Best regards,
{{instructorName}}`,
    category: 'reminder',
    variables: ['studentName', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'instructorName'],
  },
  {
    id: 'followup',
    name: 'Post-Training Follow-up',
    subject: 'Thank you for attending {{eventName}}',
    body: `Dear {{studentName}},

Thank you for your participation in {{eventName}}! It was a pleasure having you in class.

**Next Steps:**
- Your certificate will be processed within 5-7 business days
- Access your student portal for additional resources
- Complete the course evaluation survey (link will be sent separately)

**Additional Resources:**
- Practice materials are available in your student portal
- Join our community forum for ongoing support
- Consider our advanced courses to continue your education

If you have any questions about the material covered or next steps, please feel free to reach out.

Congratulations on completing your training!

Best regards,
{{instructorName}}`,
    category: 'followup',
    variables: ['studentName', 'eventName', 'instructorName'],
  },
  {
    id: 'announcement',
    name: 'Class Announcement',
    subject: 'Important Update: {{eventName}}',
    body: `Hi {{studentName}},

I wanted to share an important update regarding {{eventName}}.

{{announcementContent}}

If you have any questions or concerns, please don't hesitate to reach out to me directly.

Thank you for your attention to this matter.

Best regards,
{{instructorName}}`,
    category: 'announcement',
    variables: ['studentName', 'eventName', 'instructorName', 'announcementContent'],
  },
];

export function QuickEmailModal({ 
  isOpen, 
  onClose, 
  studentEmails, 
  eventName = 'Training Event',
  instructorName = 'Instructor',
}: QuickEmailModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isCustomEmail, setIsCustomEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      setSelectedEmails(studentEmails);
      setSelectedTemplate(null);
      setCustomSubject('');
      setCustomBody('');
      setIsCustomEmail(false);
      setSendStatus('idle');
    }
  }, [isOpen, studentEmails]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setCustomBody(template.body);
    setIsCustomEmail(false);
  };

  const handleCustomEmail = () => {
    setSelectedTemplate(null);
    setCustomSubject('');
    setCustomBody('');
    setIsCustomEmail(true);
  };

  const toggleEmailSelection = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email],
    );
  };

  const selectAllEmails = () => {
    setSelectedEmails(studentEmails);
  };

  const deselectAllEmails = () => {
    setSelectedEmails([]);
  };

  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{studentName\}\}/g, '[Student Name]')
      .replace(/\{\{eventName\}\}/g, eventName)
      .replace(/\{\{eventDate\}\}/g, '[Event Date]')
      .replace(/\{\{eventTime\}\}/g, '[Event Time]')
      .replace(/\{\{eventLocation\}\}/g, '[Event Location]')
      .replace(/\{\{instructorName\}\}/g, instructorName)
      .replace(/\{\{announcementContent\}\}/g, '[Your announcement content here]');
  };

  const sendEmail = async () => {
    if (!customSubject.trim() || !customBody.trim()) {
      toast.error('Please provide both subject and message content');
      return;
    }

    if (selectedEmails.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setIsSending(true);
    setSendStatus('sending');

    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));

      const emailData = {
        to: selectedEmails,
        subject: replaceVariables(customSubject),
        body: replaceVariables(customBody),
        template: selectedTemplate?.id,
        eventName,
        instructorName,
        timestamp: new Date().toISOString(),
      };

      // In a real implementation, this would call the email API
      console.log('Sending email:', emailData);

      setSendStatus('success');
      toast.success(`Email sent to ${selectedEmails.length} recipient${selectedEmails.length !== 1 ? 's' : ''}`);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      setSendStatus('error');
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const previewSubject = replaceVariables(customSubject);
  const previewBody = replaceVariables(customBody);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Quick Email to Class
          </DialogTitle>
          <DialogDescription>
            Send an email to your students using templates or create a custom message.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="recipients">Recipients ({selectedEmails.length})</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Email Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EMAIL_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                      className="h-auto p-4 justify-start"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {template.category}
                        </div>
                      </div>
                    </Button>
                  ))}
                  <Button
                    variant={isCustomEmail ? 'default' : 'outline'}
                    className="h-auto p-4 justify-start"
                    onClick={handleCustomEmail}
                  >
                    <div className="text-left">
                      <div className="font-medium">Custom Email</div>
                      <div className="text-xs text-muted-foreground">
                        Write your own message
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Composition */}
            {(selectedTemplate || isCustomEmail) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter email subject..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Message Body</Label>
                    <Textarea
                      id="body"
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      placeholder="Enter your message..."
                      rows={12}
                    />
                  </div>

                  {selectedTemplate && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Available variables:</strong> {selectedTemplate.variables.map(v => `{{${v}}}`).join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recipients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Select Recipients
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllEmails}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllEmails}>
                      Clear All
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {studentEmails.map((email) => (
                      <div key={email} className="flex items-center space-x-2 p-2 rounded-lg border">
                        <Checkbox
                          id={email}
                          checked={selectedEmails.includes(email)}
                          onCheckedChange={() => toggleEmailSelection(email)}
                        />
                        <Label htmlFor={email} className="flex-1 cursor-pointer">
                          {email}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-4 text-sm text-muted-foreground">
                  {selectedEmails.length} of {studentEmails.length} recipients selected
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject:</Label>
                  <div className="p-3 bg-muted rounded-lg font-medium">
                    {previewSubject || 'No subject'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Message:</Label>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {previewBody || 'No message content'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recipients:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmails.slice(0, 5).map((email) => (
                      <Badge key={email} variant="secondary">
                        {email}
                      </Badge>
                    ))}
                    {selectedEmails.length > 5 && (
                      <Badge variant="outline">
                        +{selectedEmails.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={sendEmail} 
            disabled={isSending || !customSubject.trim() || !customBody.trim() || selectedEmails.length === 0}
          >
            {sendStatus === 'sending' && <Clock className="h-4 w-4 mr-2 animate-spin" />}
            {sendStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
            {sendStatus === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
            {sendStatus === 'idle' && <Send className="h-4 w-4 mr-2" />}
            {sendStatus === 'sending' ? 'Sending...' : 
             sendStatus === 'success' ? 'Sent!' :
             sendStatus === 'error' ? 'Failed' : 
             `Send to ${selectedEmails.length} recipient${selectedEmails.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}