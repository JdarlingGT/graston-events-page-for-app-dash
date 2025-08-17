"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { status: "Upcoming", count: 15, fill: "var(--color-upcoming)" },
  { status: "Ongoing", count: 8, fill: "var(--color-ongoing)" },
  { status: "Completed", count: 23, fill: "var(--color-completed)" },
]

const chartConfig = {
  upcoming: {
    label: "Upcoming",
    color: "hsl(var(--chart-1))",
  },
  ongoing: {
    label: "Ongoing", 
    color: "hsl(var(--chart-2))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function EventSummaryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Summary</CardTitle>
        <CardDescription>Events by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} role="img" aria-label="Bar chart showing the count of events by status: Upcoming, Ongoing, and Completed.">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey="status"
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}