"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface EventSummaryChartProps {
  enrolledStudents: number;
  instrumentsPurchased: number;
}

const chartConfig = {
  value: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function EventSummaryChart({ enrolledStudents, instrumentsPurchased }: EventSummaryChartProps) {
  const data = [
    { category: "Enrolled Students", value: enrolledStudents },
    { category: "Kits Purchased", value: instrumentsPurchased },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment & Kit Sales</CardTitle>
        <CardDescription>Overview of student enrollment and instrument kit purchases for this event.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}