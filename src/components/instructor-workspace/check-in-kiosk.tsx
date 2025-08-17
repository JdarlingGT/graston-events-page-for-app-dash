"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Coffee, LogOut, LogIn } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
}

interface CheckInRecord {
  morningIn?: string;
  lunchOut?: string;
  lunchIn?: string;
  afternoonOut?: string;
}

export function CheckInKiosk({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["event-students-kiosk", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/students`);
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });

  const { data: checkIns = {}, isLoading: checkInsLoading } = useQuery<Record<string, CheckInRecord>>({
    queryKey: ["checkins", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/checkin`);
      if (!res.ok) throw new Error("Failed to fetch check-in data");
      return res.json();
    },
  });

  const checkInMutation = useMutation({
    mutationFn: ({ studentId, period }: { studentId: string; period: keyof CheckInRecord }) =>
      fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, period, timestamp: new Date().toISOString() }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins", eventId] });
      toast.success("Check-in recorded!");
    },
    onError: () => toast.error("Failed to record check-in."),
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (studentsLoading || checkInsLoading) return <Skeleton className="h-screen w-full" />;

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Event Check-in Kiosk</CardTitle>
              <CardDescription>Please find your name to sign in or out.</CardDescription>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{format(currentTime, "eeee, LLL do")}</p>
              <p className="text-3xl font-bold">{format(currentTime, "h:mm:ss a")}</p>
            </div>
          </div>
          <div className="relative pt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for your name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-3">
          {filteredStudents.map(student => (
            <div key={student.id} className="grid grid-cols-1 sm:grid-cols-5 items-center gap-2 rounded-lg border p-4">
              <div className="sm:col-span-2">
                <p className="font-medium text-lg">{student.name}</p>
              </div>
              <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant={checkIns[student.id]?.morningIn ? "default" : "outline"} onClick={() => checkInMutation.mutate({ studentId: student.id, period: 'morningIn' })}><LogIn className="mr-2 h-4 w-4" /> Morning</Button>
                <Button variant={checkIns[student.id]?.lunchOut ? "default" : "outline"} onClick={() => checkInMutation.mutate({ studentId: student.id, period: 'lunchOut' })}><Coffee className="mr-2 h-4 w-4" /> Lunch</Button>
                <Button variant={checkIns[student.id]?.lunchIn ? "default" : "outline"} onClick={() => checkInMutation.mutate({ studentId: student.id, period: 'lunchIn' })}><LogIn className="mr-2 h-4 w-4" /> Return</Button>
                <Button variant={checkIns[student.id]?.afternoonOut ? "default" : "outline"} onClick={() => checkInMutation.mutate({ studentId: student.id, period: 'afternoonOut' })}><LogOut className="mr-2 h-4 w-4" /> End</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}