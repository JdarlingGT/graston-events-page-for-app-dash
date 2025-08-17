"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Download, ExternalLink, Filter, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface AutomatorLog {
  id: string;
  timestamp: string;
  recipeName: string;
  action: string;
  user: string;
  userId: string;
  status: string;
}

const columns: ColumnDef<AutomatorLog>[] = [
  {
    accessorKey: "timestamp",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.timestamp), "MMM dd, yyyy HH:mm"),
  },
  {
    accessorKey: "recipeName",
    header: "Recipe",
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <Button variant="link" className="p-0 h-auto" onClick={() => {
        // Simulate opening FluentCRM contact
        toast.info(`Opening FluentCRM for user: ${row.original.user}`);
        // In a real app: window.open(`/wp-admin/admin.php?page=fluentcrm-admin#/subscribers/${row.original.userId}`, '_blank');
      }}>
        {row.original.user} <ExternalLink className="ml-1 h-3 w-3" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export function AutomatorLogTable() {
  const [searchFilter, setSearchFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const { data: logs = [], isLoading, error } = useQuery<AutomatorLog[]>({
    queryKey: ["automator-logs"],
    queryFn: async () => {
      const response = await fetch("/api/automator/logs");
      if (!response.ok) throw new Error("Failed to fetch automator logs");
      return response.json();
    },
  });

  const filteredLogs = logs.filter(
    (log) =>
      log.recipeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.user.toLowerCase().includes(searchFilter.toLowerCase())
  ).filter(log => {
    const logDate = new Date(log.timestamp);
    if (dateRange.from && logDate < dateRange.from) return false;
    if (dateRange.to && logDate > dateRange.to) return false;
    return true;
  });

  const handleExport = () => {
    const headers = columns.map(col => (col as any).accessorKey).join(",");
    const rows = filteredLogs.map(row => 
      columns.map(col => {
        const key = (col as any).accessorKey as keyof AutomatorLog;
        let value = row[key];
        if (key === "timestamp") {
          value = format(new Date(value as string), "yyyy-MM-dd HH:mm:ss");
        }
        return `"${value}"`;
      }).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "automator_activity_log.csv");
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
            <CardTitle>Automator Activity Log</CardTitle>
            <CardDescription>
              Monitor Uncanny Automator recipe runs and actions.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search logs..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-64"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-fit">
                  <Clock className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Date Range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange as { from: Date; to?: Date }}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-64 w-full bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredLogs} />
        )}
      </CardContent>
    </Card>
  );
}