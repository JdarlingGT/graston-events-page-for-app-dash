"use client";

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
import { toast } from "sonner";
import { useState } from "react";

interface QuickEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentEmails: string[];
}

export function QuickEmailModal({ isOpen, onClose, studentEmails }: QuickEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    // Mock sending email
    toast.success("Email sent to the class!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Class</DialogTitle>
          <DialogDescription>
            Send a quick update to all enrolled students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="bcc">BCC</Label>
            <Input id="bcc" readOnly value={`${studentEmails.length} students`} />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend}>Send Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}