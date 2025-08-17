"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, Row, ColumnFiltersState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Check,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { differenceInDays, parseISO } from "date-fns";
import { CheckInMode } from "./check-in-mode";
import { Input } from "../ui/input";
import { BulkActions } from "./bulk-actions";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  licenseNumber: string;
  providerType: string;
  licenseState: string;
  datePurchased: string;
  preCourseCompleted: boolean;
  preCourseProgress: number;
  courseProgress: number; // New: LearnDash course progress
  licenseType: string; // New: License type classification
  crmTags: string[]; // New: FluentCRM tags
  checkedIn: boolean; // New: Check-in status
  crmId: string;
  tags: string[];
  lastActivity: string;
}

interface StudentTableProps {
  eventId: string;
  eventDate: string;
}

export function StudentTable({ eventId, eventDate }: StudentTableProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCheckInMode, setIsCheckInMode] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data: students = [], isLoading, error } = useQuery<Student[]>({
    queryKey: ["event-students", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/students`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      
      // Enrich the data with new fields
      return data.map((student: any) => ({
        ...student,
        courseProgress: Math.floor(Math.random() * 100), // Mock LearnDash progress
        licenseType: getLicenseType(student.providerType),
        crmTags: generateCrmTags(student),
        checkedIn: false, // Default check-in status
      }));
    },
  });

  // Helper functions for data enrichment
  const getLicenseType = (providerType: string): string => {
    const typeMap: { [key: string]: string } = {
      "Registered Nurse": "RN License",
      "Medical Doctor": "MD License", 
      "Nurse Practitioner": "NP License",
      "Physician Assistant": "PA License",
      "Physical Therapist": "PT License"
    };
    return typeMap[providerType] || "Professional License";
  };

  const generateCrmTags = (student: any): string[] => {
    const tags = ["New Student"];
    if (student.preCourseCompleted) tags.push("Pre-Course Complete");
    if (student.instrumentsPurchased) tags.push("Kit Purchased");
    if (student.providerType.includes("Nurse")) tags.push("Nursing Professional");
    if (student.licenseState === "CA") tags.push("California Provider");
    return tags;
  };

  const handleCrmLink = (crmId: string) => {
    const crmUrl = `/wp-admin/admin.php?page=fluentcrm-admin#/subscribers/${crmId}`;
    window.open(crmUrl, '_blank');
  };

  const handleSendEmail = async (studentId: string) => {
    try {
      const response = await fetch(`/api/crm/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, eventId }),
      });
      
      if (!response.ok) throw new Error('Failed to send email');
      
      toast.success('Email sent successfully');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const handleCheckInToggle = async (studentId: string, checked: boolean) => {
    // Optimistically update the UI
    // In a real app, this would make an API call
    toast.success(checked ? 'Student checked in' : 'Student checked out');
  };

  const getRowClassName = (row: Row<Student>) => {
    const student = row.original;
    if (student.preCourseCompleted) {
      return "bg-green-50 dark:bg-green-900/20";
    }

    if (!eventDate) return "";

    const daysUntilEvent = differenceInDays(parseISO(eventDate), new Date());

    if (daysUntilEvent < 7) {
      return "bg-red-50 dark:bg-red-900/20";
    }
    if (daysUntilEvent <= 14) {
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
            table.toggleAllPageRowsSelected(e.target.checked);
            if (e.target.checked) {
              setSelectedStudents(students.map(s => s.id));
            } else {
              setSelectedStudents([]);
            }
          }}
          className="rounded border border-input"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents(prev => [...prev, row.original.id]);
            } else {
              setSelectedStudents(prev => prev.filter(id => id !== row.original.id));
            }
          }}
          className="rounded border border-input"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Student",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.avatar} />
              <AvatarFallback>
                {student.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
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
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.licenseNumber}</div>
      ),
    },
    {
      accessorKey: "licenseType",
      header: "License Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.licenseType}</Badge>
      ),
    },
    {
      accessorKey: "preCourseProgress",
      header: "Pre-Course",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="space-y-1 w-24">
            <div className="flex items-center gap-2">
              {student.preCourseCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : student.preCourseProgress > 0 ? (
                <Clock className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {student.preCourseProgress}%
              </span>
            </div>
            <Progress value={student.preCourseProgress} className="h-1" />
          </div>
        );
      },
    },
    {
      accessorKey: "courseProgress",
      header: "Course Progress",
      cell: ({ row }) => {
        const progress = row.original.courseProgress;
        return (
          <div className="space-y-1 w-24">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );
      },
    },
    {
      accessorKey: "crmTags",
      header: "CRM Tags",
      cell: ({ row }) => {
        const tags = row.original.crmTags;
        return (
          <div className="flex flex-wrap gap-1 max-w-48">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "checkedIn",
      header: "Status",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={student.checkedIn}
              onCheckedChange={(checked) => handleCheckInToggle(student.id, checked)}
            />
            <span className="text-sm text-muted-foreground">
              {student.checkedIn ? "Checked In" : "Not Checked In"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCrmLink(student.crmId)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View in CRM
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendEmail(student.id)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isCheckInMode) {
    return <CheckInMode students={students} onFinish={() => setIsCheckInMode(false)} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load student data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enrolled Students</h3>
          <p className="text-sm text-muted-foreground">
            {students.length} students enrolled • {selectedStudents.length} selected
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsCheckInMode(true)}>
            <Check className="mr-2 h-4 w-4" />
            Check-in Mode
          </Button>
        </div>
      </div>

      <BulkActions 
        selectedStudents={selectedStudents}
        eventId={eventId}
        onClearSelection={() => setSelectedStudents([])}
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search students by name..."
              value={(columnFilters.find(f => f.id === 'name')?.value as string) ?? ''}
              onChange={(event) =>
                setColumnFilters([{ id: 'name', value: event.target.value }])
              }
              className="max-w-sm"
            />
          </div>
          <DataTable 
            columns={columns} 
            data={students} 
            getRowClassName={getRowClassName}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
          />
        </div>
      )}
    </div>
  );
}