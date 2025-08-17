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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  initialNote: string;
  onSave: (note: string) => void;
}

export function AddNoteModal({ isOpen, onClose, studentName, initialNote, onSave }: AddNoteModalProps) {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
    }
  }, [isOpen, initialNote]);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note for {studentName}</DialogTitle>
          <DialogDescription>
            This note is private and will be saved to the student's permanent record.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="note">Private Note</Label>
          <Textarea id="note" rows={8} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}