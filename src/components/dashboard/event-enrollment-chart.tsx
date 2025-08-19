'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const data = [
  { date: 'Jan 1', enrolled: 120, capacity: 200 },
  { date: 'Jan 8', enrolled: 145, capacity: 200 },
  { date: 'Jan 15', enrolled: 167, capacity: 200 },
  { date: 'Jan 22', enrolled: 189, capacity: 200 },
  { date: 'Jan 29', enrolled: 195, capacity: 200 },
  { date: 'Feb 5', enrolled: 198, capacity: 200 },
  { date: 'Feb 12', enrolled: 200, capacity: 200 },
];

const chartConfig = {
  enrolled: {
    label: 'Enrolled Students',
    color: 'hsl(var(--chart-1))',
  },
  capacity: {
    label: 'Total Capacity',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function EventEnrollmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Enrollment Trends</CardTitle>
        <CardDescription>Student enrollment over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} role="img" aria-label="Line chart showing student enrollment trends over time compared to total capacity.">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="enrolled"
                stroke="var(--color-enrolled)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-enrolled)' }}
              />
              <Line
                type="monotone"
                dataKey="capacity"
                stroke="var(--color-capacity)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'var(--color-capacity)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}