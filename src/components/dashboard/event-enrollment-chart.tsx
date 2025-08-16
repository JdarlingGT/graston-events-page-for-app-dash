"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Event {
  id: string;
  name: string;
  enrolledStudents: number;
}

interface EventEnrollmentChartProps {
  data: Event[];
}

const chartConfig = {
  enrolledStudents: {
    label: "Enrolled Students",
  },
} satisfies ChartConfig

export function EventEnrollmentChart({ data }: EventEnrollmentChartProps) {
  const chartData = data.map(event => {
    let fill;
    if (event.enrolledStudents < 4) {
      fill = "hsl(var(--destructive))"; // At Risk
    } else if (event.enrolledStudents < 10) {
      fill = "hsl(var(--chart-4))"; // Warning
    } else {
      fill = "hsl(var(--chart-2))"; // OK
    }
    return {
      name: event.name,
      enrolledStudents: event.enrolledStudents,
      fill: fill,
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Enrollment Overview</CardTitle>
        <CardDescription>A visual breakdown of student enrollment per event.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 75 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                angle={-45}
                textAnchor="end"
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="enrolledStudents" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}