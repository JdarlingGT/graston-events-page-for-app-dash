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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preCourseProgress: number;
}

interface RosterState {
  attendance: boolean;
  skillsCheck: "Not Started" | "Passed" | "Needs Review";
  notes: string;
}

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  rosterState: RosterState | null;
  onSaveNotes: (studentId: string, notes: string) => void;
}

export function StudentProfileModal({ isOpen, onClose, student, rosterState, onSaveNotes }: StudentProfileModalProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && rosterState) {
      setNotes(rosterState.notes);
    }
  }, [isOpen, rosterState]);

  const handleSave = () => {
    if (student) {
      onSaveNotes(student.id, notes);
      onClose();
    }
  };

  if (!student || !rosterState) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-xl">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{student.name}</DialogTitle>
              <DialogDescription>{student.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Attendance</Label>
              <Badge variant={rosterState.attendance ? "default" : "secondary"}>
                {rosterState.attendance ? "Present" : "Absent"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>Skills Check</Label>
              <Badge variant={rosterState.skillsCheck === "Passed" ? "default" : rosterState.skillsCheck === "Needs Review" ? "secondary" : "outline"}>
                {rosterState.skillsCheck}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pre-course Progress</Label>
            <div className="flex items-center gap-2">
              <Progress value={student.preCourseProgress} className="h-2" />
              <span>{student.preCourseProgress}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructor-notes">Instructor Notes</Label>
            <Textarea
              id="instructor-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Add private notes about this student's performance..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}