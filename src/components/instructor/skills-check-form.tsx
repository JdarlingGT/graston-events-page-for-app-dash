'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  skillsCheck: {
    status: 'not_started' | 'in_progress' | 'passed' | 'needs_review';
    score?: number;
    feedback?: string;
    completedAt?: string;
  };
}

interface SkillsCheckFormProps {
  trainingId: string;
}

const SKILLS_CHECK_CRITERIA = [
  {
    id: 'technique',
    label: 'Proper Technique',
    description: 'Demonstrates correct hand positioning and tool angles',
  },
  {
    id: 'pressure',
    label: 'Pressure Control',
    description: 'Applies appropriate pressure throughout treatment',
  },
  {
    id: 'assessment',
    label: 'Assessment Skills',
    description: 'Accurately identifies treatment areas and tissue quality',
  },
  {
    id: 'safety',
    label: 'Safety Protocols',
    description: 'Follows all safety guidelines and precautions',
  },
];

export function SkillsCheckForm({ trainingId }: SkillsCheckFormProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['training-students-skills', trainingId],
    queryFn: async () => {
      const response = await fetch(`/api/trainings/${trainingId}/students`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      return response.json();
    },
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: {
      studentId: string;
      assessment: Record<string, number>;
      feedback: string;
    }) => {
      const response = await fetch(
        `/api/trainings/${trainingId}/students/${data.studentId}/skills-check`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            criteria: data.assessment,
            feedback: data.feedback,
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }
      return response.json();
    },
    onSuccess: () => {
      setSelectedStudent(null);
      setAssessment({});
      setFeedback('');
    },
  });

  const handleSubmit = () => {
    if (!selectedStudent) return;

    submitAssessmentMutation.mutate({
      studentId: selectedStudent,
      assessment,
      feedback,
    });
  };

  if (isLoading) {
    return <Skeleton className="h-[600px]" />;
  }

  const completedCount = students.filter(
    (s) => s.skillsCheck.status === 'passed' || s.skillsCheck.status === 'needs_review'
  ).length;
  const progress = (completedCount / students.length) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="font-medium mb-2">Skills Check Progress</h3>
            <Progress value={progress} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {completedCount} / {students.length}
            </div>
            <div className="text-sm text-muted-foreground">Students Completed</div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Student List */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Students</h3>
          <div className="space-y-2">
            {students.map((student) => (
              <Button
                key={student.id}
                variant={selectedStudent === student.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedStudent(student.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div>
                    <div className="font-medium text-left">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.skillsCheck.status === 'passed' && (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Passed
                        </span>
                      )}
                      {student.skillsCheck.status === 'needs_review' && (
                        <span className="flex items-center text-yellow-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Needs Review
                        </span>
                      )}
                      {student.skillsCheck.status === 'not_started' && 'Not Started'}
                      {student.skillsCheck.status === 'in_progress' && 'In Progress'}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Assessment Form */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Skills Assessment</h3>
          {selectedStudent ? (
            <div className="space-y-6">
              {SKILLS_CHECK_CRITERIA.map((criteria) => (
                <div key={criteria.id} className="space-y-2">
                  <Label>{criteria.label}</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {criteria.description}
                  </p>
                  <RadioGroup
                    value={assessment[criteria.id]?.toString()}
                    onValueChange={(value) =>
                      setAssessment((prev) => ({
                        ...prev,
                        [criteria.id]: parseInt(value),
                      }))
                    }
                  >
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value.toString()} id={`${criteria.id}-${value}`} />
                          <Label htmlFor={`${criteria.id}-${value}`}>{value}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}

              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed feedback on the student's performance..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStudent(null);
                    setAssessment({});
                    setFeedback('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    Object.keys(assessment).length < SKILLS_CHECK_CRITERIA.length ||
                    !feedback ||
                    submitAssessmentMutation.isPending
                  }
                >
                  {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a student to begin assessment
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}