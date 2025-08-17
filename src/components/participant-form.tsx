"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  licenseNumber: z.string().min(5, "License number is required."),
  clinicName: z.string().min(3, "Clinic name is required."),
  clinicAddress: z.string().min(10, "Clinic address is required."),
});

export function ParticipantForm({ token }: { token: string }) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licenseNumber: "",
      clinicName: "",
      clinicAddress: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Signature is required.");
      return;
    }
    const signature = sigCanvas.current?.toDataURL();
    
    // In a real app, you'd send this data to your backend
    console.log({ ...values, signature });
    
    toast.success("Profile updated successfully!");
    // Here you might redirect or show a success message
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide the following information to finalize your registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Address</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel id="signature-label">Digital Signature</FormLabel>
              <div className="rounded-lg border bg-background" role="application" aria-labelledby="signature-label">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: "w-full h-32" }}
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => sigCanvas.current?.clear()}>
                Clear Signature
              </Button>
            </div>
            <Button type="submit" className="w-full">Submit Information</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}