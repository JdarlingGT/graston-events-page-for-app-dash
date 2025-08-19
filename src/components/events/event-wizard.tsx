'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Mail, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Save,
  Copy,
  Trash2,
  AlertTriangle,
  Clock,
  Building,
  User,
  Phone,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WizardMode = 'create' | 'edit' | 'duplicate';
type WizardStep = 'basics' | 'schedule' | 'venue' | 'pricing' | 'communications' | 'review';

interface EventFormData {
  // Basics
  name: string;
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: 'In-Person' | 'Virtual' | 'Hybrid';
  description: string;
  instructor: string;
  
  // Schedule
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  
  // Venue
  venueName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  venueNotes: string;
  
  // Pricing & Capacity
  capacity: number;
  minViableEnrollment: number;
  price: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  
  // Communications
  publicDescription: string;
  registrationInstructions: string;
  confirmationEmailTemplate: string;
  reminderEmailTemplate: string;
  
  // Meta
  status: 'draft' | 'published' | 'cancelled';
  featuredImage?: string;
}

interface EventWizardProps {
  mode: WizardMode;
  eventId?: string;
  initialData?: Partial<EventFormData>;
  onComplete?: (eventId: string) => void;
  onCancel?: () => void;
}

const WIZARD_STEPS: { key: WizardStep; title: string; description: string; icon: any }[] = [
  { key: 'basics', title: 'Event Basics', description: 'Core event information', icon: Building },
  { key: 'schedule', title: 'Schedule', description: 'Date, time, and duration', icon: Calendar },
  { key: 'venue', title: 'Venue & Location', description: 'Where the event takes place', icon: MapPin },
  { key: 'pricing', title: 'Pricing & Capacity', description: 'Enrollment and pricing details', icon: DollarSign },
  { key: 'communications', title: 'Communications', description: 'Email templates and messaging', icon: Mail },
  { key: 'review', title: 'Review & Publish', description: 'Final review and confirmation', icon: CheckCircle },
];

const DEFAULT_FORM_DATA: EventFormData = {
  name: '',
  type: 'Essential',
  mode: 'In-Person',
  description: '',
  instructor: '',
  startDate: '',
  endDate: '',
  startTime: '09:00',
  endTime: '17:00',
  timezone: 'America/New_York',
  venueName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  venueNotes: '',
  capacity: 20,
  minViableEnrollment: 8,
  price: 0,
  publicDescription: '',
  registrationInstructions: '',
  confirmationEmailTemplate: '',
  reminderEmailTemplate: '',
  status: 'draft',
};

export function EventWizard({ mode, eventId, initialData, onComplete, onCancel }: EventWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const [formData, setFormData] = useState<EventFormData>({ ...DEFAULT_FORM_DATA, ...initialData });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  useEffect(() => {
    if (mode === 'edit' && eventId) {
      loadEventData();
    }
  }, [mode, eventId]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();
        setFormData(prev => ({ ...prev, ...eventData }));
      }
    } catch (error) {
      toast.error('Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const updatedErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete updatedErrors[key];
    });
    setErrors(updatedErrors);
  };

  const validateStep = (step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basics':
        if (!formData.name.trim()) newErrors.name = 'Event name is required';
        if (!formData.instructor.trim()) newErrors.instructor = 'Instructor is required';
        break;
      case 'schedule':
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;
      case 'venue':
        if (formData.mode !== 'Virtual') {
          if (!formData.city.trim()) newErrors.city = 'City is required';
          if (!formData.state.trim()) newErrors.state = 'State is required';
        }
        break;
      case 'pricing':
        if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
        if (formData.minViableEnrollment <= 0) newErrors.minViableEnrollment = 'Minimum viable enrollment must be greater than 0';
        if (formData.minViableEnrollment > formData.capacity) {
          newErrors.minViableEnrollment = 'Minimum viable enrollment cannot exceed capacity';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < WIZARD_STEPS.length) {
        setCurrentStep(WIZARD_STEPS[nextIndex].key);
      }
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(WIZARD_STEPS[prevIndex].key);
    }
  };

  const saveAsDraft = async () => {
    setIsLoading(true);
    try {
      const payload = { ...formData, status: 'draft' };
      const url = mode === 'edit' && eventId ? `/api/events/${eventId}` : '/api/events';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Event saved as draft');
        onComplete?.(result.id || eventId!);
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const publishEvent = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const payload = { ...formData, status: 'published' };
      const url = mode === 'edit' && eventId ? `/api/events/${eventId}` : '/api/events';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Event ${mode === 'edit' ? 'updated' : 'created'} successfully`);
        onComplete?.(result.id || eventId!);
      } else {
        throw new Error('Failed to publish event');
      }
    } catch (error) {
      toast.error('Failed to publish event');
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateEvent = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/duplicate`, { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        toast.success('Event duplicated successfully');
        onComplete?.(result.id);
      }
    } catch (error) {
      toast.error('Failed to duplicate event');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g., Essential Skills Workshop - Austin"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor *</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => updateFormData({ instructor: e.target.value })}
                  placeholder="Instructor name"
                  className={errors.instructor ? 'border-destructive' : ''}
                />
                {errors.instructor && <p className="text-sm text-destructive">{errors.instructor}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Course Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => updateFormData({ type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Essential">Essential</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Upper Quadrant">Upper Quadrant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Delivery Mode</Label>
                <Select value={formData.mode} onValueChange={(value: any) => updateFormData({ mode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Internal Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Internal notes and description for team reference"
                rows={3}
              />
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData({ startDate: e.target.value })}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData({ endDate: e.target.value })}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateFormData({ startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateFormData({ endTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(value) => updateFormData({ timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'venue':
        return (
          <div className="space-y-6">
            {formData.mode !== 'Virtual' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="venueName">Venue Name</Label>
                  <Input
                    id="venueName"
                    value={formData.venueName}
                    onChange={(e) => updateFormData({ venueName: e.target.value })}
                    placeholder="e.g., Austin Convention Center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      placeholder="City"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateFormData({ state: e.target.value })}
                      placeholder="State"
                      className={errors.state ? 'border-destructive' : ''}
                    />
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => updateFormData({ zipCode: e.target.value })}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.mode === 'Virtual' && (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Virtual Event</h3>
                <p>Virtual event details will be provided to attendees via email.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="venueNotes">Venue Notes</Label>
              <Textarea
                id="venueNotes"
                value={formData.venueNotes}
                onChange={(e) => updateFormData({ venueNotes: e.target.value })}
                placeholder="Parking instructions, accessibility notes, etc."
                rows={3}
              />
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Event Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => updateFormData({ capacity: parseInt(e.target.value) || 0 })}
                  className={errors.capacity ? 'border-destructive' : ''}
                />
                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minViableEnrollment">Minimum Viable Enrollment *</Label>
                <Input
                  id="minViableEnrollment"
                  type="number"
                  min="1"
                  value={formData.minViableEnrollment}
                  onChange={(e) => updateFormData({ minViableEnrollment: parseInt(e.target.value) || 0 })}
                  className={errors.minViableEnrollment ? 'border-destructive' : ''}
                />
                {errors.minViableEnrollment && <p className="text-sm text-destructive">{errors.minViableEnrollment}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Regular Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="earlyBirdPrice">Early Bird Price</Label>
                <Input
                  id="earlyBirdPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.earlyBirdPrice || ''}
                  onChange={(e) => updateFormData({ earlyBirdPrice: parseFloat(e.target.value) || undefined })}
                />
              </div>
            </div>

            {formData.earlyBirdPrice && (
              <div className="space-y-2">
                <Label htmlFor="earlyBirdDeadline">Early Bird Deadline</Label>
                <Input
                  id="earlyBirdDeadline"
                  type="date"
                  value={formData.earlyBirdDeadline || ''}
                  onChange={(e) => updateFormData({ earlyBirdDeadline: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'communications':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="publicDescription">Public Description</Label>
              <Textarea
                id="publicDescription"
                value={formData.publicDescription}
                onChange={(e) => updateFormData({ publicDescription: e.target.value })}
                placeholder="Description that will be shown to potential attendees"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationInstructions">Registration Instructions</Label>
              <Textarea
                id="registrationInstructions"
                value={formData.registrationInstructions}
                onChange={(e) => updateFormData({ registrationInstructions: e.target.value })}
                placeholder="Special instructions for registration"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmationEmailTemplate">Confirmation Email Template</Label>
              <Textarea
                id="confirmationEmailTemplate"
                value={formData.confirmationEmailTemplate}
                onChange={(e) => updateFormData({ confirmationEmailTemplate: e.target.value })}
                placeholder="Email template sent upon registration confirmation"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderEmailTemplate">Reminder Email Template</Label>
              <Textarea
                id="reminderEmailTemplate"
                value={formData.reminderEmailTemplate}
                onChange={(e) => updateFormData({ reminderEmailTemplate: e.target.value })}
                placeholder="Email template for event reminders"
                rows={4}
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {formData.name}</div>
                  <div><strong>Type:</strong> <Badge variant="secondary">{formData.type}</Badge></div>
                  <div><strong>Mode:</strong> <Badge variant="outline">{formData.mode}</Badge></div>
                  <div><strong>Instructor:</strong> {formData.instructor}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Start:</strong> {formData.startDate} at {formData.startTime}</div>
                  <div><strong>End:</strong> {formData.endDate} at {formData.endTime}</div>
                  <div><strong>Timezone:</strong> {formData.timezone}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formData.mode === 'Virtual' ? (
                    <div>Virtual Event</div>
                  ) : (
                    <>
                      {formData.venueName && <div><strong>Venue:</strong> {formData.venueName}</div>}
                      <div><strong>Location:</strong> {formData.city}, {formData.state}</div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Capacity & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Capacity:</strong> {formData.capacity} attendees</div>
                  <div><strong>Min Viable:</strong> {formData.minViableEnrollment} attendees</div>
                  <div><strong>Price:</strong> ${formData.price}</div>
                  {formData.earlyBirdPrice && (
                    <div><strong>Early Bird:</strong> ${formData.earlyBirdPrice}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'create' && 'Create New Event'}
            {mode === 'edit' && 'Edit Event'}
            {mode === 'duplicate' && 'Duplicate Event'}
          </h1>
          <p className="text-muted-foreground">
            {WIZARD_STEPS.find(step => step.key === currentStep)?.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="outline" onClick={saveAsDraft} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Step {currentStepIndex + 1} of {WIZARD_STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
        {WIZARD_STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = index < currentStepIndex;
          
          return (
            <button
              key={step.key}
              onClick={() => setCurrentStep(step.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isActive && 'bg-primary text-primary-foreground',
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
            {React.createElement(WIZARD_STEPS[currentStepIndex].icon, { className: "h-5 w-5" })}
            {WIZARD_STEPS[currentStepIndex].title}
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
          {currentStep === 'review' ? (
            <>
              <Button onClick={publishEvent} disabled={isLoading}>
                {isLoading ? 'Publishing...' : `${mode === 'edit' ? 'Update Event' : 'Publish Event'}`}
              </Button>
              {mode === 'edit' && (
                <Button variant="outline" onClick={duplicateEvent} disabled={isLoading}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              )}
            </>
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