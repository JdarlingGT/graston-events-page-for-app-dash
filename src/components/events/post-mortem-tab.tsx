'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export function PostMortemTab() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Post-mortem report saved successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Post-Mortem</CardTitle>
        <CardDescription>
          Capture key metrics and feedback after the event concludes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="finalAttendance">Final Attendance</Label>
              <Input id="finalAttendance" type="number" placeholder="e.g., 45" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalRevenue">Total Revenue</Label>
              <Input id="totalRevenue" type="number" placeholder="e.g., 26955" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="satisfactionScore">Avg. Satisfaction (1-5)</Label>
              <Input id="satisfactionScore" type="number" step="0.1" placeholder="e.g., 4.8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatWentWell">What went well?</Label>
            <Textarea id="whatWentWell" rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatCouldBeImproved">What could be improved?</Label>
            <Textarea id="whatCouldBeImproved" rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyTakeaways">Key takeaways & action items</Label>
            <Textarea id="keyTakeaways" rows={4} />
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Report
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}