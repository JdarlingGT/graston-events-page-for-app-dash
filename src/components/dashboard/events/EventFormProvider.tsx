'use client';

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema, EventFormData } from './types';

interface EventFormProviderProps {
  children: React.ReactNode;
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
}

export const EventFormProvider: React.FC<EventFormProviderProps> = ({
  children,
  initialData,
  onSubmit,
}) => {
  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      coreDetails: {
        name: initialData?.coreDetails?.name || '',
        description: initialData?.coreDetails?.description || '',
        type: initialData?.coreDetails?.type || 'workshop',
        price: initialData?.coreDetails?.price || 0,
      },
      logistics: {
        venueId: initialData?.logistics?.venueId || '',
        instructorId: initialData?.logistics?.instructorId || '',
        startDate: initialData?.logistics?.startDate || '',
        endDate: initialData?.logistics?.endDate || '',
      },
      schedule: {
        capacity: initialData?.schedule?.capacity || 1,
        registrationDeadline: initialData?.schedule?.registrationDeadline || '',
        schedule: initialData?.schedule?.schedule || [],
      },
      content: {
        materials: initialData?.content?.materials || [],
        prerequisites: initialData?.content?.prerequisites || [],
        objectives: initialData?.content?.objectives || [],
      },
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {children}
      </form>
    </FormProvider>
  );
};

export default EventFormProvider;