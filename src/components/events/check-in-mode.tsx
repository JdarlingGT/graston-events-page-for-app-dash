'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface CheckInModeProps {
  students: Student[];
  onFinish: () => void;
}

export function CheckInMode({ students, onFinish }: CheckInModeProps) {
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (studentId: string) => {
    setCheckedIn(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const progress = students.length > 0 ? (checkedIn.size / students.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Event Check-in</CardTitle>
            <CardDescription>Tablet-friendly view for day-of-event check-in.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{checkedIn.size} / {students.length} Checked In</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto">
        <div className="space-y-4">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="text-lg font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
              <Checkbox
                checked={checkedIn.has(student.id)}
                onCheckedChange={() => handleToggle(student.id)}
                className="h-8 w-8"
              />
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-6 border-t">
        <Button onClick={onFinish} className="w-full">Finish Check-in</Button>
      </div>
    </Card>
  );
}