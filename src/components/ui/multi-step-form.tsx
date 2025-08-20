'use client';

import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MultiStepFormProps {
  steps: {
    id: string;
    label: string;
    content: ReactNode;
  }[];
  onSubmit: (values: any) => void;
  initialValues?: any;
}

export function MultiStepForm({ steps, onSubmit, initialValues = {} }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(initialValues);

  const handleNext = (stepValues: any) => {
    const newValues = { ...formValues, ...stepValues };
    setFormValues(newValues);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onSubmit(formValues);
  };

  const currentStepInfo = steps[currentStep];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentStepInfo.label}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentStepInfo.content}

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={() => handleNext({})}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}