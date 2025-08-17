"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { EventFormValues, eventSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ContentCopilotModal } from "@/components/events/content-copilot-modal";

interface Event {
  id: string;
  title: string;
  status: "Go" | "At Risk" | "Completed";
  startDate: string;
  endDate: string;
  location: {
    city: string;
    state: string;
    venueId: string | null;
  };
  courseType: string;
  capacity: number;
  enrolledCount: number;
  revenue: number;
  instructorIds: string[];
}

interface EventFormProps {
  initialData?: Event | null;
}

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [socialMediaContent, setSocialMediaContent] = useState("");

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: "",
      status: "Go",
      startDate: "",
      endDate: "",
      location: { city: "", state: "", venueId: null },
      courseType: "",
      capacity: 25,
      enrolledCount: 0,
      revenue: 0,
      instructorIds: [],
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    setLoading(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/events/${initialData.id}`
        : "/api/events";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${initialData ? "update" : "create"} event`);
      }

      toast.success(`Event ${initialData ? "updated" : "created"} successfully!`);
      
      if (!initialData) {
        const eventType = values.courseType.includes("In-Person") ? "In-Person" : "Virtual";
        await fetch('/api/tasks/bulkCreate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType, eventName: values.title })
        });
        toast.info("Relevant setup tasks have been automatically created.");
      }

      if (socialMediaContent) {
        toast.info("Social media posts have been scheduled.");
      }
      router.push("/dashboard/events");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Edit Event" : "Create Event"}</CardTitle>
          <CardDescription>
            Fill in the details below to {initialData ? "update the" : "add a new"}{" "}
            event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Essential Training | Chicago, IL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Essential In-Person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Austin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., TX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Go">Go</SelectItem>
                          <SelectItem value="At Risk">At Risk</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Marketing Automation Section */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-medium">Marketing Automation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Schedule Announcement Email</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Automatically send a sequence to your mailing list.
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Generate Initial Social Media Posts</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Use AI to create engaging posts for your channels.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCopilotOpen(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI Co-Pilot
                    </Button>
                  </div>
                  {socialMediaContent && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Generated Content Preview:</p>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap italic">
                        "{socialMediaContent.substring(0, 150)}..."
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/events")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <ContentCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onSave={setSocialMediaContent}
        eventName={form.getValues("title") || "this amazing event"}
      />
    </>
  );
}