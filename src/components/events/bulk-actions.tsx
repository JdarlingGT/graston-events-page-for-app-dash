'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Download,
  Mail,
  UserPlus,
  Tag,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandedLoader } from '../ui/branded-loader';

interface BulkActionsProps {
  selectedStudents: string[];
  eventId: string;
  onClearSelection: () => void;
}

export function BulkActions({ selectedStudents, eventId, onClearSelection }: BulkActionsProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const queryClient = useQueryClient();

  const bulkEmailMutation = useMutation({
    mutationFn: async (data: { studentIds: string[]; subject: string; template: string }) => {
      const response = await fetch('/api/crm/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
throw new Error('Failed to send bulk email');
}
      return response.json();
    },
    onSuccess: () => {
      toast.success(`Email sent to ${selectedStudents.length} students`);
      setIsEmailOpen(false);
      onClearSelection();
    },
    onError: () => {
      toast.error('Failed to send bulk email');
    },
  });

  const importStudentsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId);
      
      const response = await fetch(`/api/events/${eventId}/import-students`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
throw new Error('Failed to import students');
}
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Successfully imported ${data.count} students`);
      queryClient.invalidateQueries({ queryKey: ['event-students', eventId] });
      setIsImportOpen(false);
    },
    onError: () => {
      toast.error('Failed to import students');
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      // In a real app, this would be a POST to /api/events/[id]/students
      // For this demo, we'll just simulate it.
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newStudent = { id: `student-${Date.now()}`, ...studentData };
      return newStudent;
    },
    onSuccess: async (newStudent) => {
      toast.success('Student added successfully');
      await fetch(`/api/students/${newStudent.id}/send-welcome`, { method: 'POST' });
      toast.info(`Welcome email simulation triggered for ${newStudent.name}.`);
      queryClient.invalidateQueries({ queryKey: ['event-students', eventId] });
      setIsAddStudentOpen(false);
    },
    onError: () => {
      toast.error('Failed to add student');
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importStudentsMutation.mutate(file);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/export-students`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-${eventId}-students.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Student data exported successfully');
    } catch (error) {
      toast.error('Failed to export student data');
    }
  };

  const handleBulkEmail = () => {
    bulkEmailMutation.mutate({
      studentIds: selectedStudents,
      subject: emailSubject,
      template: emailTemplate,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {selectedStudents.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedStudents.length} selected
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsEmailOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="mr-2 h-4 w-4" />
                Add Tags
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Add to Sequence
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearSelection}>
                Clear Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="flex gap-2">
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Students</DialogTitle>
              <DialogDescription>
                Upload a CSV file with student information. Required columns: name, email, licenseNumber, providerType, licenseState.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">CSV File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={importStudentsMutation.isPending}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <a href="/templates/student-import-template.csv" className="text-primary hover:underline">
                  Download template file
                </a>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Manually add a student to this event. They will be created in FluentCRM and enrolled in the LearnDash group.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addStudentMutation.mutate({
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                licenseNumber: formData.get('licenseNumber'),
                providerType: formData.get('providerType'),
                licenseState: formData.get('licenseState'),
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input id="licenseNumber" name="licenseNumber" required />
                  </div>
                  <div>
                    <Label htmlFor="licenseState">State</Label>
                    <Select name="licenseState" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        {/* Add more states */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="providerType">Provider Type</Label>
                  <Select name="providerType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Registered Nurse">Registered Nurse</SelectItem>
                      <SelectItem value="Medical Doctor">Medical Doctor</SelectItem>
                      <SelectItem value="Nurse Practitioner">Nurse Practitioner</SelectItem>
                      <SelectItem value="Physician Assistant">Physician Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addStudentMutation.isPending} className="w-28">
                  {addStudentMutation.isPending ? <BrandedLoader /> : 'Add Student'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bulk Email Dialog */}
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedStudents.length} selected students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div>
              <Label htmlFor="template">Message</Label>
              <Textarea
                id="template"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                placeholder="Email message..."
                rows={8}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Available variables: {'{name}'}, {'{email}'}, {'{event_name}'}, {'{event_date}'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkEmail}
              disabled={bulkEmailMutation.isPending || !emailSubject || !emailTemplate}
              className="w-28"
            >
              {bulkEmailMutation.isPending ? <BrandedLoader /> : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}