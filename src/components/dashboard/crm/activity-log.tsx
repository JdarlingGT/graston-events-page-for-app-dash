"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Activity {
  id: string;
  date: string;
  contact: string;
  action: string;
  source: string;
}

interface ActivityLogProps {
  data: Activity[];
}

export const columns: ColumnDef<Activity>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "contact", header: "Contact Name" },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "source", header: "Source" },
];

export function ActivityLog({ data }: ActivityLogProps) {
  const [filter, setFilter] = useState("");

  const filteredData = data.filter(
    (item) =>
      item.contact.toLowerCase().includes(filter.toLowerCase()) ||
      item.action.toLowerCase().includes(filter.toLowerCase()) ||
      item.source.toLowerCase().includes(filter.toLowerCase())
  );

  const handleExport = () => {
    const headers = columns.map(col => (col as any).accessorKey).join(",");
    const rows = filteredData.map(row => 
      columns.map(col => {
        const key = (col as any).accessorKey as keyof Activity;
        return `"${row[key]}"`;
      }).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Activity log exported successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contact Activity Log</CardTitle>
            <CardDescription>
              Real-time log of contact activities and events.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search log..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={filteredData} />
      </CardContent>
    </Card>
  );
}