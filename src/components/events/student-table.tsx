"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, Row, ColumnFiltersState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  ExternalLink, 
  Mail, 
  MoreHorizontal,
  Check,
  User,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { differenceInDays, parseISO, isAfter, setHours, setMinutes } from "date-fns";
import { CheckInMode } from "./check-in-mode";
import { Input } from "../ui/input";
import { BulkActions } from "./bulk-actions";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  licenseNumber: string;
  providerType: string;
  preCourseProgress: number;
  preCourseCompleted: boolean;
  courseProgress: number;
  licenseType: string;
  crmTags: string[];
  crmId: string;
}

interface CheckInRecord {
  morningIn?: string;
}

interface StudentTableProps {
  eventId: string;
  eventDate: string;
}

export function StudentTable({ eventId, eventDate }: StudentTableProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCheckInMode, setIsCheckInMode] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useQuery<Student[]>({
    queryKey: ["event-students", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/students`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      return data.map((student: any) => ({
        ...student,
        courseProgress: Math.floor(Math.random() * 100),
        licenseType: student.providerType.includes("Nurse") ? "RN License" : "Professional License",
        crmTags: ["New Student", student.preCourseCompleted ? "Pre-Course Complete" : "Pre-Course Incomplete"],
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: checkIns = {}, isLoading: checkInsLoading } = useQuery<Record<string, CheckInRecord>>({
    queryKey: ["checkins", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/checkin`);
      if (!res.ok) throw new Error("Failed to fetch check-in data");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const handleCrmLink = (crmId: string) => {
    window.open(`/wp-admin/admin.php?page=fluentcrm-admin#/subscribers/${crmId}`, '_blank');
  };

  const getRowClassName = (row: Row<Student>) => {
    const student = row.original;
    const daysUntilEvent = differenceInDays(parseISO(eventDate), new Date());
    if (!student.preCourseCompleted && daysUntilEvent < 7 && daysUntilEvent >= 0) {
      return "bg-red-50 dark:bg-red-900/20";
    }
    if (!student.preCourseCompleted && daysUntilEvent <= 14 && daysUntilEvent >= 0) {
      return "bg-yellow-50 dark:bg-yellow-900/20";
    }
    return "";
  };

  const columns: ColumnDef<Student>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            const isChecked = e.target.checked;
            table.toggleAllPageRowsSelected(isChecked);
            setSelectedStudents(isChecked ? students.map(s => s.id) : []);
          }}
          className="rounded border border-input"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => {
            row.toggleSelected(e.target.checked);
            setSelectedStudents(prev => 
              e.target.checked ? [...prev, row.original.id] : prev.filter(id => id !== row.original.id)
            );
          }}
          className="rounded border border-input"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Student",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8"><AvatarImage src={student.avatar} /><AvatarFallback>{student.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback></Avatar>
            <div>
              <div className="font-medium">{student.name}</div>
              <div className="text-sm text-muted-foreground">{student.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "licenseNumber",
      header: "License #",
    },
    {
      accessorKey: "preCourseProgress",
      header: "Pre-Course",
      cell: ({ row }) => <Progress value={row.original.preCourseProgress} className="h-2" />,
    },
    {
      accessorKey: "courseProgress",
      header: "Course Progress",
      cell: ({ row }) => <Progress value={row.original.courseProgress} className="h-2" />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const studentId = row.original.id;
        const hasCheckedIn = !!checkIns[studentId]?.morningIn;
        const eventDay = parseISO(eventDate);
        const checkInDeadline = setMinutes(setHours(eventDay, 9), 30);
        const isPastDeadline = isAfter(new Date(), checkInDeadline);
        const isAbsent = isPastDeadline && !hasCheckedIn;

        if (isAbsent) {
          return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Absent</Badge>;
        }
        return <Badge variant={hasCheckedIn ? "default" : "secondary"}>{hasCheckedIn ? "Checked In" : "Not Arrived"}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCrmLink(row.original.crmId)}><ExternalLink className="mr-2 h-4 w-4" />View in CRM</DropdownMenuItem>
            <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Send Email</DropdownMenuItem>
            <DropdownMenuItem><User className="mr-2 h-4 w-4" />View Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isCheckInMode) {
    return <CheckInMode students={students} onFinish={() => setIsCheckInMode(false)} />;
  }

  if (studentsError) {
    return <div className="text-center py-8"><p className="text-destructive">Failed to load student data</p></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enrolled Students</h3>
          <p className="text-sm text-muted-foreground">{students.length} students enrolled • {selectedStudents.length} selected</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsCheckInMode(true)}><Check className="mr-2 h-4 w-4" />Check-in Mode</Button>
      </div>
      <BulkActions selectedStudents={selectedStudents} eventId={eventId} onClearSelection={() => setSelectedStudents([])} />
      {studentsLoading || checkInsLoading ? (
        <div className="space-y-2"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-64 w-full" /></div>
      ) : (
        <div>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search students by name..."
              value={(columnFilters.find(f => f.id === 'name')?.value as string) ?? ''}
              onChange={(event) => setColumnFilters([{ id: 'name', value: event.target.value }])}
              className="max-w-sm"
            />
          </div>
          <DataTable columns={columns} data={students} getRowClassName={getRowClassName} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
        </div>
      )}
    </div>
  );
}