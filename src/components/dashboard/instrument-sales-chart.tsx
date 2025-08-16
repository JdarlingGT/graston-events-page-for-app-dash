"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Event {
  name: string;
  instrumentsPurchased: number;
}

interface InstrumentSalesChartProps {
  data: Event[];
}

const chartConfig = {
  instrumentsPurchased: {
    label: "Instruments Purchased",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function InstrumentSalesChart({ data }: InstrumentSalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrument Sales</CardTitle>
        <CardDescription>A breakdown of instrument kits sold for each event.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 75 }}>
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
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="instrumentsPurchased"
                fill="var(--color-instrumentsPurchased)"
                radius={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}