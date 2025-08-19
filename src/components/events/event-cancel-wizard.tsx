'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle,
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  RefreshCw,
  Trash2,
  Users,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CancelStep = 'reason' | 'notifications' | 'refunds' | 'logistics' | 'confirmation';

interface EventData {
  id: string;
  name: string;
  title?: string;
  city: string;
  state: string;
  instructor?: string;
  enrolledStudents: number;
  capacity: number;
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: 'In-Person' | 'Virtual' | 'Hybrid';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
}

interface CancelFormData {
  // Reason
  cancelReason: 'low-enrollment' | 'instructor-unavailable' | 'venue-issues' | 'force-majeure' | 'other';
  customReason: string;
  internalNotes: string;
  
  // Notifications
  notifyEnrolledStudents: boolean;
  emailTemplate: string;
  notifyInstructor: boolean;
  instructorMessage: string;
  notifyStakeholders: boolean;
  stakeholderList: string[];
  
  // Refunds
  offerFullRefund: boolean;
  offerPartialRefund: boolean;
  partialRefundPercentage: number;
  offerCredit: boolean;
  creditExpirationMonths: number;
  refundDeadline: string;
  
  // Logistics
  cancelVenueBooking: boolean;
  returnEquipment: boolean;
  updateWebsite: boolean;
  updateMarketingMaterials: boolean;
  createFollowUpTasks: boolean;
  
  // Confirmation
  confirmCancellation: boolean;
  acknowledgeImpact: boolean;
}

interface EventCancelWizardProps {
  eventId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const CANCEL_STEPS: { key: CancelStep; title: string; description: string; icon: any }[] = [
  { key: 'reason', title: 'Cancellation Reason', description: 'Why is this event being cancelled?', icon: AlertTriangle },
  { key: 'notifications', title: 'Notifications', description: 'Who needs to be notified?', icon: Mail },
  { key: 'refunds', title: 'Refunds & Credits', description: 'How will attendees be compensated?', icon: DollarSign },
  { key: 'logistics', title: 'Logistics & Cleanup', description: 'What needs to be rolled back?', icon: RefreshCw },
  { key: 'confirmation', title: 'Final Confirmation', description: 'Review and confirm cancellation', icon: CheckCircle },
];

const DEFAULT_FORM_DATA: CancelFormData = {
  cancelReason: 'low-enrollment',
  customReason: '',
  internalNotes: '',
  notifyEnrolledStudents: true,
  emailTemplate: '',
  notifyInstructor: true,
  instructorMessage: '',
  notifyStakeholders: true,
  stakeholderList: ['operations@company.com', 'marketing@company.com'],
  offerFullRefund: true,
  offerPartialRefund: false,
  partialRefundPercentage: 50,
  offerCredit: false,
  creditExpirationMonths: 12,
  refundDeadline: '',
  cancelVenueBooking: true,
  returnEquipment: true,
  updateWebsite: true,
  updateMarketingMaterials: true,
  createFollowUpTasks: true,
  confirmCancellation: false,
  acknowledgeImpact: false,
};

const EMAIL_TEMPLATES = {
  'low-enrollment': `Dear [Student Name],

We regret to inform you that the [Event Name] scheduled for [Event Date] in [Location] has been cancelled due to insufficient enrollment.

We understand this may cause inconvenience and sincerely apologize for any disruption to your plans.

REFUND INFORMATION:
- Full refund will be processed within 5-7 business days
- Refund will be credited to your original payment method

ALTERNATIVE OPTIONS:
- We will notify you of future events in your area
- Priority registration for rescheduled events

If you have any questions, please contact our support team at support@company.com or call (555) 123-4567.

Thank you for your understanding.

Best regards,
The Events Team`,

  'instructor-unavailable': `Dear [Student Name],

We regret to inform you that the [Event Name] scheduled for [Event Date] in [Location] has been cancelled due to instructor unavailability.

We understand this may cause inconvenience and sincerely apologize for any disruption to your plans.

REFUND INFORMATION:
- Full refund will be processed within 5-7 business days
- Refund will be credited to your original payment method

ALTERNATIVE OPTIONS:
- We are working to reschedule this event and will notify you first
- Priority registration for similar events with other qualified instructors

If you have any questions, please contact our support team at support@company.com or call (555) 123-4567.

Thank you for your understanding.

Best regards,
The Events Team`,

  'venue-issues': `Dear [Student Name],

We regret to inform you that the [Event Name] scheduled for [Event Date] in [Location] has been cancelled due to unforeseen venue issues.

We understand this may cause inconvenience and sincerely apologize for any disruption to your plans.

REFUND INFORMATION:
- Full refund will be processed within 5-7 business days
- Refund will be credited to your original payment method

ALTERNATIVE OPTIONS:
- We are actively seeking an alternative venue and will notify you if we can reschedule
- Priority registration for future events in your area

If you have any questions, please contact our support team at support@company.com or call (555) 123-4567.

Thank you for your understanding.

Best regards,
The Events Team`,
};

export function EventCancelWizard({ eventId, onComplete, onCancel }: EventCancelWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CancelStep>('reason');
  const [formData, setFormData] = useState<CancelFormData>(DEFAULT_FORM_DATA);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepIndex = CANCEL_STEPS.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / CANCEL_STEPS.length) * 100;

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  useEffect(() => {
    // Set default email template based on cancel reason
    if (formData.cancelReason && EMAIL_TEMPLATES[formData.cancelReason as keyof typeof EMAIL_TEMPLATES]) {
      setFormData(prev => ({
        ...prev,
        emailTemplate: EMAIL_TEMPLATES[formData.cancelReason as keyof typeof EMAIL_TEMPLATES]
      }));
    }
  }, [formData.cancelReason]);

  useEffect(() => {
    // Set default refund deadline to 30 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      refundDeadline: defaultDeadline.toISOString().split('T')[0]
    }));
  }, []);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEventData(data);
      } else {
        toast.error('Failed to load event data');
      }
    } catch (error) {
      toast.error('Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<CancelFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const updatedErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete updatedErrors[key];
    });
    setErrors(updatedErrors);
  };

  const validateStep = (step: CancelStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'reason':
        if (formData.cancelReason === 'other' && !formData.customReason.trim()) {
          newErrors.customReason = 'Please provide a custom reason';
        }
        break;
      case 'notifications':
        if (formData.notifyEnrolledStudents && !formData.emailTemplate.trim()) {
          newErrors.emailTemplate = 'Email template is required';
        }
        if (formData.notifyInstructor && !formData.instructorMessage.trim()) {
          newErrors.instructorMessage = 'Instructor message is required';
        }
        break;
      case 'refunds':
        if (formData.offerPartialRefund && (formData.partialRefundPercentage <= 0 || formData.partialRefundPercentage > 100)) {
          newErrors.partialRefundPercentage = 'Percentage must be between 1 and 100';
        }
        if (!formData.refundDeadline) {
          newErrors.refundDeadline = 'Refund deadline is required';
        }
        break;
      case 'confirmation':
        if (!formData.confirmCancellation) {
          newErrors.confirmCancellation = 'You must confirm the cancellation';
        }
        if (!formData.acknowledgeImpact) {
          newErrors.acknowledgeImpact = 'You must acknowledge the impact';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < CANCEL_STEPS.length) {
        setCurrentStep(CANCEL_STEPS[nextIndex].key);
      }
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(CANCEL_STEPS[prevIndex].key);
    }
  };

  const cancelEvent = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        eventId,
        cancelledAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/events/${eventId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Event cancelled successfully');
        onComplete?.();
      } else {
        throw new Error('Failed to cancel event');
      }
    } catch (error) {
      toast.error('Failed to cancel event');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'reason':
        return (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cancelling an event is a significant decision that affects enrolled students, instructors, and business operations. Please provide a clear reason for the cancellation.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="cancelReason">Primary Reason for Cancellation</Label>
              <Select value={formData.cancelReason} onValueChange={(value: any) => updateFormData({ cancelReason: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low-enrollment">Low Enrollment / Below Minimum Viable</SelectItem>
                  <SelectItem value="instructor-unavailable">Instructor Unavailable</SelectItem>
                  <SelectItem value="venue-issues">Venue Issues / Unavailable</SelectItem>
                  <SelectItem value="force-majeure">Force Majeure (Weather, Emergency, etc.)</SelectItem>
                  <SelectItem value="other">Other (Please Specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.cancelReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Custom Reason *</Label>
                <Input
                  id="customReason"
                  value={formData.customReason}
                  onChange={(e) => updateFormData({ customReason: e.target.value })}
                  placeholder="Please specify the reason for cancellation"
                  className={errors.customReason ? 'border-destructive' : ''}
                />
                {errors.customReason && <p className="text-sm text-destructive">{errors.customReason}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                value={formData.internalNotes}
                onChange={(e) => updateFormData({ internalNotes: e.target.value })}
                placeholder="Additional context for internal team reference"
                rows={4}
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyEnrolledStudents"
                  checked={formData.notifyEnrolledStudents}
                  onCheckedChange={(checked) => updateFormData({ notifyEnrolledStudents: !!checked })}
                />
                <Label htmlFor="notifyEnrolledStudents" className="font-medium">
                  Notify Enrolled Students ({eventData?.enrolledStudents || 0} students)
                </Label>
              </div>

              {formData.notifyEnrolledStudents && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="emailTemplate">Email Template *</Label>
                  <Textarea
                    id="emailTemplate"
                    value={formData.emailTemplate}
                    onChange={(e) => updateFormData({ emailTemplate: e.target.value })}
                    placeholder="Email message to send to enrolled students"
                    rows={8}
                    className={errors.emailTemplate ? 'border-destructive' : ''}
                  />
                  {errors.emailTemplate && <p className="text-sm text-destructive">{errors.emailTemplate}</p>}
                  <p className="text-xs text-muted-foreground">
                    Available placeholders: [Student Name], [Event Name], [Event Date], [Location]
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyInstructor"
                  checked={formData.notifyInstructor}
                  onCheckedChange={(checked) => updateFormData({ notifyInstructor: !!checked })}
                />
                <Label htmlFor="notifyInstructor" className="font-medium">
                  Notify Instructor ({eventData?.instructor || 'Unassigned'})
                </Label>
              </div>

              {formData.notifyInstructor && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="instructorMessage">Message to Instructor *</Label>
                  <Textarea
                    id="instructorMessage"
                    value={formData.instructorMessage}
                    onChange={(e) => updateFormData({ instructorMessage: e.target.value })}
                    placeholder="Personal message to the instructor about the cancellation"
                    rows={4}
                    className={errors.instructorMessage ? 'border-destructive' : ''}
                  />
                  {errors.instructorMessage && <p className="text-sm text-destructive">{errors.instructorMessage}</p>}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyStakeholders"
                  checked={formData.notifyStakeholders}
                  onCheckedChange={(checked) => updateFormData({ notifyStakeholders: !!checked })}
                />
                <Label htmlFor="notifyStakeholders" className="font-medium">
                  Notify Internal Stakeholders
                </Label>
              </div>

              {formData.notifyStakeholders && (
                <div className="space-y-2 ml-6">
                  <Label>Stakeholder Email List</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.stakeholderList.map((email, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            const newList = formData.stakeholderList.filter((_, i) => i !== index);
                            updateFormData({ stakeholderList: newList });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add stakeholder email"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const email = (e.target as HTMLInputElement).value.trim();
                        if (email && !formData.stakeholderList.includes(email)) {
                          updateFormData({ stakeholderList: [...formData.stakeholderList, email] });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'refunds':
        return (
          <div className="space-y-6">
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Choose how enrolled students will be compensated for the cancelled event. This affects {eventData?.enrolledStudents || 0} students.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offerFullRefund"
                  checked={formData.offerFullRefund}
                  onCheckedChange={(checked) => updateFormData({ offerFullRefund: !!checked })}
                />
                <Label htmlFor="offerFullRefund" className="font-medium">
                  Offer Full Refund (100% of payment)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offerPartialRefund"
                  checked={formData.offerPartialRefund}
                  onCheckedChange={(checked) => updateFormData({ offerPartialRefund: !!checked })}
                />
                <Label htmlFor="offerPartialRefund" className="font-medium">
                  Offer Partial Refund
                </Label>
              </div>

              {formData.offerPartialRefund && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="partialRefundPercentage">Refund Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="partialRefundPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.partialRefundPercentage}
                      onChange={(e) => updateFormData({ partialRefundPercentage: parseInt(e.target.value) || 0 })}
                      className={`w-20 ${errors.partialRefundPercentage ? 'border-destructive' : ''}`}
                    />
                    <span>%</span>
                  </div>
                  {errors.partialRefundPercentage && <p className="text-sm text-destructive">{errors.partialRefundPercentage}</p>}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offerCredit"
                  checked={formData.offerCredit}
                  onCheckedChange={(checked) => updateFormData({ offerCredit: !!checked })}
                />
                <Label htmlFor="offerCredit" className="font-medium">
                  Offer Event Credit (for future events)
                </Label>
              </div>

              {formData.offerCredit && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="creditExpirationMonths">Credit Expiration (months)</Label>
                  <Select
                    value={formData.creditExpirationMonths.toString()}
                    onValueChange={(value) => updateFormData({ creditExpirationMonths: parseInt(value) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="18">18 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="refundDeadline">Refund Request Deadline *</Label>
              <Input
                id="refundDeadline"
                type="date"
                value={formData.refundDeadline}
                onChange={(e) => updateFormData({ refundDeadline: e.target.value })}
                className={errors.refundDeadline ? 'border-destructive' : ''}
              />
              {errors.refundDeadline && <p className="text-sm text-destructive">{errors.refundDeadline}</p>}
              <p className="text-xs text-muted-foreground">
                Students must request refunds by this date
              </p>
            </div>
          </div>
        );

      case 'logistics':
        return (
          <div className="space-y-6">
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertDescription>
                Select which operational items need to be handled as part of the cancellation process.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cancelVenueBooking"
                  checked={formData.cancelVenueBooking}
                  onCheckedChange={(checked) => updateFormData({ cancelVenueBooking: !!checked })}
                />
                <Label htmlFor="cancelVenueBooking" className="font-medium">
                  Cancel Venue Booking
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="returnEquipment"
                  checked={formData.returnEquipment}
                  onCheckedChange={(checked) => updateFormData({ returnEquipment: !!checked })}
                />
                <Label htmlFor="returnEquipment" className="font-medium">
                  Return/Reallocate Equipment
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="updateWebsite"
                  checked={formData.updateWebsite}
                  onCheckedChange={(checked) => updateFormData({ updateWebsite: !!checked })}
                />
                <Label htmlFor="updateWebsite" className="font-medium">
                  Update Website/Event Listings
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="updateMarketingMaterials"
                  checked={formData.updateMarketingMaterials}
                  onCheckedChange={(checked) => updateFormData({ updateMarketingMaterials: !!checked })}
                />
                <Label htmlFor="updateMarketingMaterials" className="font-medium">
                  Update Marketing Materials
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createFollowUpTasks"
                  checked={formData.createFollowUpTasks}
                  onCheckedChange={(checked) => updateFormData({ createFollowUpTasks: !!checked })}
                />
                <Label htmlFor="createFollowUpTasks" className="font-medium">
                  Create Follow-up Tasks
                </Label>
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. The event will be permanently cancelled and all associated processes will be triggered.
              </AlertDescription>
            </Alert>

            {eventData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>Event:</strong> {eventData.title || eventData.name}
                    </div>
                    <div>
                      <strong>Date:</strong> {formatDate(eventData.date || eventData.startDate)}
                    </div>
                    <div>
                      <strong>Location:</strong> {eventData.city}, {eventData.state}
                    </div>
                    <div>
                      <strong>Enrolled Students:</strong> {eventData.enrolledStudents}
                    </div>
                    <div>
                      <strong>Instructor:</strong> {eventData.instructor || 'Unassigned'}
                    </div>
                    <div>
                      <strong>Type:</strong> <Badge variant="secondary">{eventData.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Cancellation Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{eventData?.enrolledStudents || 0} students will be affected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.notifyEnrolledStudents ? 'Students will be notified' : 'Students will NOT be notified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formData.offerFullRefund ? 'Full refunds will be offered' :
                     formData.offerPartialRefund ? `${formData.partialRefundPercentage}% refunds will be offered` :
                     formData.offerCredit ? 'Event credits will be offered' : 'No compensation offered'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[
                      formData.cancelVenueBooking && 'Venue booking',
                      formData.returnEquipment && 'Equipment',
                      formData.updateWebsite && 'Website',
                      formData.updateMarketingMaterials && 'Marketing materials'
                    ].filter(Boolean).join(', ')} will be updated
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmCancellation"
                  checked={formData.confirmCancellation}
                  onCheckedChange={(checked) => updateFormData({ confirmCancellation: !!checked })}
                  className={errors.confirmCancellation ? 'border-destructive' : ''}
                />
                <Label htmlFor="confirmCancellation" className="font-medium">
                  I confirm that I want to cancel this event *
                </Label>
              </div>
              {errors.confirmCancellation && <p className="text-sm text-destructive ml-6">{errors.confirmCancellation}</p>}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acknowledgeImpact"
                  checked={formData.acknowledgeImpact}
                  onCheckedChange={(checked) => updateFormData({ acknowledgeImpact: !!checked })}
                  className={errors.acknowledgeImpact ? 'border-destructive' : ''}
                />
                <Label htmlFor="acknowledgeImpact" className="font-medium">
                  I acknowledge the impact on students, instructors, and business operations *
                </Label>
              </div>
              {errors.acknowledgeImpact && <p className="text-sm text-destructive ml-6">{errors.acknowledgeImpact}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading && !eventData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-destructive">Cancel Event</h1>
          <p className="text-muted-foreground">
            {eventData?.title || eventData?.name} - {CANCEL_STEPS.find(step => step.key === currentStep)?.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel Process
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Step {currentStepIndex + 1} of {CANCEL_STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
        {CANCEL_STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = index < currentStepIndex;
          
          return (
            <button
              key={step.key}
              onClick={() => setCurrentStep(step.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isActive && 'bg-destructive text-destructive-foreground',
                isCompleted && !isActive && 'bg-muted text-muted-foreground',
                !isActive && !isCompleted && 'text-muted-foreground hover:text-foreground'
              )}
            >
              <StepIcon className="h-4 w-4" />
              {step.title}
              {isCompleted && <CheckCircle className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(CANCEL_STEPS[currentStepIndex].icon, { className: "h-5 w-5" })}
            {CANCEL_STEPS[currentStepIndex].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStepIndex === 0 || isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep === 'confirmation' ? (
            <Button variant="destructive" onClick={cancelEvent} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling Event...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel Event
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={isLoading}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
                    