"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface UtmSource {
  source: string;
  leads: number;
  converted: number;
  revenue: number; // Added revenue
}

interface UTMAnalysisProps {
  data: UtmSource[];
}

const pieChartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const barChartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--chart-1))",
  },
  converted: {
    label: "Converted",
    color: "hsl(var(--chart-2))",
  },
  revenue: { // Added revenue to chart config
    label: "Revenue",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function UTMAnalysis({ data }: UTMAnalysisProps) {
  const chartData = data.map(item => ({
    ...item,
    conversionRate: ((item.converted / item.leads) * 100).toFixed(2) + '%',
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Leads by Source</CardTitle>
          <CardDescription>Distribution of leads from different UTM sources.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="min-h-[300px] w-full" role="img" aria-label="Pie chart showing the distribution of leads from different UTM sources.">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} dataKey="leads" nameKey="source" cx="50%" cy="50%" outerRadius={100} label>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Lead Conversion & Revenue Analysis</CardTitle>
          <CardDescription>Comparison of leads, converted customers, and revenue by source.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="min-h-[300px] w-full" role="img" aria-label="Bar chart comparing leads, converted customers, and revenue by UTM source.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="source" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={4} />
                <Bar dataKey="converted" fill="var(--color-converted)" radius={4} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} /> {/* Added revenue bar */}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}