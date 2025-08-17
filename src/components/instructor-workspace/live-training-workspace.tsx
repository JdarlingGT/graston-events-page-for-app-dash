"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InstructorResourcePod } from "./instructor-resource-pod";
import { QuickEmailModal } from "./quick-email-modal";
import { AddNoteModal } from "./add-note-modal";
import { Mail, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  preCourseProgress: number;
}

interface RosterState {
  attendance: boolean;
  skillsCheck: "Not Started" | "Passed" | "Needs Review";
  notes: string;
}

interface EventDetails {
  name: string;
  date: string;
}

export function LiveTrainingWorkspace({ eventId }: { eventId: string }) {
  const [roster, setRoster] = useState<Record<string, RosterState>>({});
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: event, isLoading: eventLoading } = useQuery<EventDetails>({
    queryKey: ["event-details", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch event details");
      return res.json();
    },
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["event-students-roster", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/students`);
      if (!res.ok) throw new Error("Failed to fetch student roster");
      return res.json();
    },
  });

  useEffect(() => {
    if (students.length > 0) {
      const initialRoster: Record<string, RosterState> = {};
      students.forEach(student => {
        initialRoster[student.id] = {
          attendance: false,
          skillsCheck: "Not Started",
          notes: "",
        };
      });
      setRoster(initialRoster);
    }
  }, [students]);

  const updateRoster = (studentId: string, updates: Partial<RosterState>) => {
    setRoster(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...updates },
    }));
  };

  const submitRosterMutation = useMutation({
    mutationFn: (finalRoster: any[]) =>
      fetch(`/api/trainings/${eventId}/roster-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalRoster),
      }),
    onSuccess: () => {
      toast.success("Final roster submitted successfully!");
    },
    onError: () => {
      toast.error("Failed to submit roster. Please try again.");
    },
  });

  const handleSubmitRoster = () => {
    const finalRoster = students.map(student => ({
      studentId: student.id,
      ...roster[student.id],
    }));
    submitRosterMutation.mutate(finalRoster);
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "preCourseProgress",
      header: "Pre-course",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.preCourseProgress} className="w-24 h-2" />
          <span>{row.original.preCourseProgress}%</span>
        </div>
      ),
    },
    {
      id: "attendance",
      header: "Attendance",
      cell: ({ row }) => (
        <Switch
          checked={roster[row.original.id]?.attendance || false}
          onCheckedChange={(checked) => updateRoster(row.original.id, { attendance: checked })}
          className="data-[state=checked]:bg-green-500"
        />
      ),
    },
    {
      id: "skillsCheck",
      header: "Skills Check",
      cell: ({ row }) => (
        <Select
          value={roster[row.original.id]?.skillsCheck || "Not Started"}
          onValueChange={(value: RosterState["skillsCheck"]) => updateRoster(row.original.id, { skillsCheck: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="Passed">Passed</SelectItem>
            <SelectItem value="Needs Review">Needs Review</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedStudent(row.original);
            setIsNoteModalOpen(true);
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Note
        </Button>
      ),
    },
  ];

  const passedCount = Object.values(roster).filter(s => s.skillsCheck === "Passed").length;
  const classProgress = students.length > 0 ? (passedCount / students.length) * 100 : 0;

  if (eventLoading || studentsLoading) {
    return <Skeleton className="h-[80vh] w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{event?.name}</h1>
              <p className="text-muted-foreground">{event?.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
            </div>
            <Button onClick={() => setIsEmailModalOpen(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Email Class
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Class Progress</span>
              <span>{passedCount} / {students.length} Passed</span>
            </div>
            <Progress value={classProgress} />
          </div>
          <DataTable
            columns={columns}
            data={students}
            getRowClassName={(row) => {
              const status = roster[row.original.id]?.skillsCheck;
              if (status === "Passed") return "bg-green-50 dark:bg-green-950";
              if (status === "Needs Review") return "bg-yellow-50 dark:bg-yellow-950";
              return "";
            }}
          />
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSubmitRoster}
              disabled={submitRosterMutation.isPending}
            >
              {submitRosterMutation.isPending ? "Submitting..." : "Submit Final Roster"}
            </Button>
          </div>
        </div>
        <div className="lg:col-span-1">
          <InstructorResourcePod />
        </div>
      </div>
      <QuickEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        studentEmails={students.map(s => s.email)}
      />
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        studentName={selectedStudent?.name || ""}
        initialNote={roster[selectedStudent?.id || ""]?.notes || ""}
        onSave={(note: string) => {
          if (selectedStudent) {
            updateRoster(selectedStudent.id, { notes: note });
          }
        }}
      />
    </div>
  );
}