"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { month: "Jan", instruments: 89, accessories: 45 },
  { month: "Feb", instruments: 95, accessories: 52 },
  { month: "Mar", instruments: 87, accessories: 48 },
  { month: "Apr", instruments: 102, accessories: 61 },
  { month: "May", instruments: 98, accessories: 55 },
  { month: "Jun", instruments: 115, accessories: 67 },
]

const chartConfig = {
  instruments: {
    label: "Instruments",
    color: "hsl(var(--chart-1))",
  },
  accessories: {
    label: "Accessories",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function InstrumentSalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrument Sales</CardTitle>
        <CardDescription>Monthly instrument and accessory sales</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <XAxis
                dataKey="month"
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
              <Area
                type="monotone"
                dataKey="instruments"
                stackId="1"
                stroke="var(--color-instruments)"
                fill="var(--color-instruments)"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="accessories"
                stackId="1"
                stroke="var(--color-accessories)"
                fill="var(--color-accessories)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}