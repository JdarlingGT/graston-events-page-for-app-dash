'use client';

import React from 'react';
import { EventFormData } from './types';
import EventFormProvider from './EventFormProvider';
import { Button } from '../../ui/button';
import { useFormContext } from 'react-hook-form';
import CoreDetailsStep from './steps/CoreDetailsStep';
import LogisticsStep from './steps/LogisticsStep';
import ScheduleStep from './steps/ScheduleStep';
import ContentStep from './steps/ContentStep';

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
}

const steps = [
  { title: 'Core Details', component: CoreDetailsStep },
  { title: 'Logistics', component: LogisticsStep },
  { title: 'Schedule & Capacity', component: ScheduleStep },
  { title: 'Content', component: ContentStep },
] as const;

const FormStepper = () => {
  const { formState } = useFormContext<EventFormData>();
  const [currentStep, setCurrentStep] = React.useState(0);

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`flex items-center ${
              index < steps.length - 1 ? 'flex-1' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      <CurrentStepComponent />

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={previousStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button type="submit" disabled={!formState.isValid}>
            Create Event
          </Button>
        ) : (
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit }) => {
  return (
    <EventFormProvider initialData={initialData} onSubmit={onSubmit}>
      <FormStepper />
    </EventFormProvider>
  );
};

export default EventForm;