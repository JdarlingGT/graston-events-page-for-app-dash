'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useRef } from 'react';
import { PenTool, RotateCcw, Save, FileSignature, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
}

interface SkillsEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (studentId: string, result: { status: 'Passed' | 'Needs Review'; notes: string }) => void;
}

const skills = [
  'Demonstrates proper tool handling',
  'Identifies correct treatment areas',
  'Applies appropriate pressure',
  'Maintains patient comfort',
  'Completes full protocol sequence',
];

export function SkillsEvaluationModal({ isOpen, onClose, student, onSave }: SkillsEvaluationModalProps) {
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});
  const [finalStatus, setFinalStatus] = useState<'Passed' | 'Needs Review'>('Passed');
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState<'evaluation' | 'signature'>('evaluation');
  const [studentSignature, setStudentSignature] = useState<string>('');
  const [instructorSignature, setInstructorSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeSignaturePad, setActiveSignaturePad] = useState<'student' | 'instructor' | null>(null);
  
  const studentCanvasRef = useRef<HTMLCanvasElement>(null);
  const instructorCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCheckedSkills({});
      setFinalStatus('Passed');
      setNotes('');
      setCurrentStep('evaluation');
      setStudentSignature('');
      setInstructorSignature('');
      setActiveSignaturePad(null);
    }
  }, [isOpen]);

  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, type: 'student' | 'instructor') => {
    const canvas = type === 'student' ? studentCanvasRef.current : instructorCanvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setActiveSignaturePad(type);
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeSignaturePad) return;
    
    const canvas = activeSignaturePad === 'student' ? studentCanvasRef.current : instructorCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !activeSignaturePad) return;
    
    setIsDrawing(false);
    
    const canvas = activeSignaturePad === 'student' ? studentCanvasRef.current : instructorCanvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      if (activeSignaturePad === 'student') {
        setStudentSignature(dataURL);
      } else {
        setInstructorSignature(dataURL);
      }
    }
    
    setActiveSignaturePad(null);
  };

  const clearSignature = (type: 'student' | 'instructor') => {
    const canvas = type === 'student' ? studentCanvasRef.current : instructorCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    if (type === 'student') {
      setStudentSignature('');
    } else {
      setInstructorSignature('');
    }
  };

  const proceedToSignature = () => {
    const passedSkills = Object.values(checkedSkills).filter(Boolean).length;
    const totalSkills = skills.length;
    
    if (passedSkills < totalSkills * 0.8) {
      setFinalStatus('Needs Review');
    }
    
    setCurrentStep('signature');
  };

  const handleSave = () => {
    if (!student) return;

    if (currentStep === 'signature') {
      if (!studentSignature || !instructorSignature) {
        toast.error('Both student and instructor signatures are required');
        return;
      }
    }

    const evaluationData = {
      status: finalStatus,
      notes,
      skillsChecked: checkedSkills,
      studentSignature: currentStep === 'signature' ? studentSignature : undefined,
      instructorSignature: currentStep === 'signature' ? instructorSignature : undefined,
      timestamp: new Date().toISOString(),
    };

    onSave(student.id, evaluationData);
    toast.success('Skills evaluation saved successfully');
  };

  const passedSkillsCount = Object.values(checkedSkills).filter(Boolean).length;
  const skillsCompletionRate = (passedSkillsCount / skills.length) * 100;

  useEffect(() => {
    if (studentCanvasRef.current) {
      initializeCanvas(studentCanvasRef.current);
    }
    if (instructorCanvasRef.current) {
      initializeCanvas(instructorCanvasRef.current);
    }
  }, [currentStep]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Skills Evaluation: {student?.name}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'evaluation'
              ? 'Assess the student\'s performance on key skills.'
              : 'Collect digital signatures to complete the evaluation.'
            }
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'evaluation' && (
          <div className="space-y-6 py-4">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Skills Progress
                  <Badge variant={skillsCompletionRate >= 80 ? 'default' : 'secondary'}>
                    {passedSkillsCount}/{skills.length} Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>{Math.round(skillsCompletionRate)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        skillsCompletionRate >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${skillsCompletionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Checklist */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Required Skills Checklist</Label>
              <div className="grid gap-3">
                {skills.map((skill, index) => (
                  <div key={skill} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id={skill}
                      checked={checkedSkills[skill] || false}
                      onCheckedChange={(checked) =>
                        setCheckedSkills((prev) => ({ ...prev, [skill]: !!checked }))
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor={skill} className="text-sm font-medium leading-none cursor-pointer">
                        {skill}
                      </label>
                      <div className="text-xs text-muted-foreground mt-1">
                        Skill {index + 1} of {skills.length}
                      </div>
                    </div>
                    {checkedSkills[skill] && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Final Assessment */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Final Assessment</Label>
              <RadioGroup
                value={finalStatus}
                onValueChange={(value: 'Passed' | 'Needs Review') => setFinalStatus(value)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border">
                  <RadioGroupItem value="Passed" id="passed" />
                  <Label htmlFor="passed" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Passed
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border">
                  <RadioGroupItem value="Needs Review" id="needs-review" />
                  <Label htmlFor="needs-review" className="flex items-center gap-2 cursor-pointer">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Needs Review
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Instructor Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base font-semibold">Instructor Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any specific feedback, observations, or recommendations..."
                rows={4}
              />
            </div>
          </div>
        )}

        {currentStep === 'signature' && (
          <div className="space-y-6 py-4">
            {/* Evaluation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evaluation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Skills Completed:</span>
                  <Badge variant="secondary">{passedSkillsCount}/{skills.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Final Status:</span>
                  <Badge variant={finalStatus === 'Passed' ? 'default' : 'secondary'}>
                    {finalStatus}
                  </Badge>
                </div>
                {notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Digital Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Signature */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Student Signature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-2">
                    <canvas
                      ref={studentCanvasRef}
                      width={300}
                      height={150}
                      className="w-full h-32 cursor-crosshair"
                      onMouseDown={(e) => startDrawing(e, 'student')}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearSignature('student')}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    {studentSignature && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Signed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Student acknowledges completion of skills evaluation
                  </p>
                </CardContent>
              </Card>

              {/* Instructor Signature */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Instructor Signature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-2">
                    <canvas
                      ref={instructorCanvasRef}
                      width={300}
                      height={150}
                      className="w-full h-32 cursor-crosshair"
                      onMouseDown={(e) => startDrawing(e, 'instructor')}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearSignature('instructor')}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    {instructorSignature && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Signed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Instructor certifies the accuracy of this evaluation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {currentStep === 'evaluation' ? (
            <Button onClick={proceedToSignature}>
              Continue to Signatures
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('evaluation')}>
                Back to Evaluation
              </Button>
              <Button onClick={handleSave} disabled={!studentSignature || !instructorSignature}>
                <Save className="h-4 w-4 mr-2" />
                Complete Evaluation
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}