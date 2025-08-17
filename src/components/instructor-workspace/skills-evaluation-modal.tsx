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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
}

interface SkillsEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (studentId: string, result: { status: "Passed" | "Needs Review"; notes: string }) => void;
}

const skills = [
  "Demonstrates proper tool handling",
  "Identifies correct treatment areas",
  "Applies appropriate pressure",
  "Maintains patient comfort",
  "Completes full protocol sequence",
];

export function SkillsEvaluationModal({ isOpen, onClose, student, onSave }: SkillsEvaluationModalProps) {
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});
  const [finalStatus, setFinalStatus] = useState<"Passed" | "Needs Review">("Passed");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCheckedSkills({});
      setFinalStatus("Passed");
      setNotes("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (student) {
      onSave(student.id, { status: finalStatus, notes });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Skills Evaluation: {student?.name}</DialogTitle>
          <DialogDescription>
            Assess the student's performance on key skills.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Required Skills Checklist</Label>
            {skills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={skill}
                  checked={checkedSkills[skill] || false}
                  onCheckedChange={(checked) =>
                    setCheckedSkills((prev) => ({ ...prev, [skill]: !!checked }))
                  }
                />
                <label htmlFor={skill} className="text-sm font-medium leading-none">
                  {skill}
                </label>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Label>Final Assessment</Label>
            <RadioGroup value={finalStatus} onValueChange={(value: "Passed" | "Needs Review") => setFinalStatus(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Passed" id="passed" />
                <Label htmlFor="passed">Passed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Needs Review" id="needs-review" />
                <Label htmlFor="needs-review">Needs Review</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label htmlFor="notes">Instructor Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific feedback or observations..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Evaluation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}