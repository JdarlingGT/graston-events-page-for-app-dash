'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../../../ui/form';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Plus, X } from 'lucide-react';
import { EventFormData } from '../types';

type ArrayFieldProps = {
  title: string;
  name: keyof EventFormData['content'];
  placeholder: string;
};

const ContentArrayField = ({ title, name, placeholder }: ArrayFieldProps) => {
  const { control } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `content.${name}` as any,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {title}
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <FormField
            control={control}
            name={`content.${name}.${index}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder={placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
          >
            <X className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
};

const ContentStep = () => {
  const { control } = useFormContext<EventFormData>();

  return (
    <div className="space-y-8">
      <ContentArrayField
        title="Materials"
        name="materials"
        placeholder="Enter required material"
      />
      <ContentArrayField
        title="Prerequisites"
        name="prerequisites"
        placeholder="Enter prerequisite"
      />
      <ContentArrayField
        title="Learning Objectives"
        name="objectives"
        placeholder="Enter learning objective"
      />
    </div>
  );
};

export default ContentStep;