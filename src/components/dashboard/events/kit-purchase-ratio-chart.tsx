"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface KitPurchaseRatioChartProps {
  enrolledStudents: number;
  instrumentsPurchased: number;
}

const chartConfig = {
  value: {
    label: "Students",
    color: "hsl(var(--chart-1))", // Added a default color for 'value'
  },
  "Kits Purchased": {
    color: "hsl(var(--chart-2))",
  },
  "No Kit": {
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function KitPurchaseRatioChart({ enrolledStudents, instrumentsPurchased }: KitPurchaseRatioChartProps) {
  const data = [
    { name: "Kits Purchased", value: instrumentsPurchased },
    { name: "No Kit", value: enrolledStudents - instrumentsPurchased },
  ].filter(item => item.value > 0); // Filter out categories with 0 value

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kit Purchase Ratio</CardTitle>
        <CardDescription>Breakdown of students who purchased kits vs. those who did not.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-0">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={2}
                fill="var(--color-value)"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || "hsl(var(--chart-1))"}
                  />
                ))}
              </Pie>
              <Legend
                content={({ payload }) => (
                  <ul className="flex flex-col gap-2">
                    {payload?.map((entry: any, index: number) => (
                      <li
                        key={`item-${index}`}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <div className="leading-none text-muted-foreground">
                          {entry.value} ({((entry.payload.value / enrolledStudents) * 100).toFixed(1)}%)
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                className="-translate-x-10 flex-col gap-2"
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}