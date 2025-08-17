"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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
  crmId: string;
  tags: string[];
  lastActivity: string;
}

interface StudentTableProps {
  eventId: string;
}

export function StudentTable({ eventId }: StudentTableProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ["event-students", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/students`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      return response.json();
    },
  });

  const handleCrmLink = (crmId: string) => {
    // Open FluentCRM contact in new tab
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

  const columns: ColumnDef<Student>[] = [
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
                {student.name.split(' ').map(n => n[0]).join('')}
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
      accessorKey: "providerType",
      header: "Provider Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.providerType}</Badge>
      ),
    },
    {
      accessorKey: "licenseState",
      header: "State",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {row.original.licenseState}
        </div>
      ),
    },
    {
      accessorKey: "datePurchased",
      header: "Purchased",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.datePurchased).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "preCourseProgress",
      header: "Pre-Course",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="space-y-1">
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
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {row.original.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.tags.length - 2}
            </Badge>
          )}
        </div>
      ),
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
              {student.phone && (
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Student
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
            {students.length} students enrolled
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Import Students
          </Button>
          <Button size="sm">
            Add Student
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={students} 
        searchPlaceholder="Search students..."
        isLoading={isLoading}
      />
    </div>
  );
}