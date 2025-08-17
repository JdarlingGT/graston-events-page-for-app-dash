"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Coffee, LogOut, LogIn } from "lucide-react";
import { format } from "date-fns";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [checkIns, setCheckIns] = useState<Record<string, CheckInRecord>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["event-students-kiosk", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/students`);
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = (studentId: string, period: keyof CheckInRecord) => {
    setCheckIns(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [period]: new Date().toISOString(),
      },
    }));
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Skeleton className="h-screen w-full" />;

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
                <Button variant={checkIns[student.id]?.morningIn ? "default" : "outline"} onClick={() => handleCheckIn(student.id, 'morningIn')}><LogIn className="mr-2 h-4 w-4" /> Morning</Button>
                <Button variant={checkIns[student.id]?.lunchOut ? "default" : "outline"} onClick={() => handleCheckIn(student.id, 'lunchOut')}><Coffee className="mr-2 h-4 w-4" /> Lunch</Button>
                <Button variant={checkIns[student.id]?.lunchIn ? "default" : "outline"} onClick={() => handleCheckIn(student.id, 'lunchIn')}><LogIn className="mr-2 h-4 w-4" /> Return</Button>
                <Button variant={checkIns[student.id]?.afternoonOut ? "default" : "outline"} onClick={() => handleCheckIn(student.id, 'afternoonOut')}><LogOut className="mr-2 h-4 w-4" /> End</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}