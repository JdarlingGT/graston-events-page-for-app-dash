"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Users } from "lucide-react";
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface Stage {
  stage: string;
  count: number;
}

interface PipelineFunnelProps {
  stages: Stage[];
  conversionRates: Record<string, number>;
}

const conversionRateKeys = [
  "GTU_to_Essential",
  "Essential_to_Completed",
  "Completed_to_Advanced",
  "Advanced_to_Completed",
];

export function PipelineFunnel({ stages, conversionRates }: PipelineFunnelProps) {
  // Prepare data for FunnelChart
  const funnelData = stages.map((s, index) => ({
    name: s.stage,
    value: s.count,
    fill: `hsl(var(--chart-${index + 1}))`, // Dynamic colors
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Health & Funnel</CardTitle>
        <CardDescription>Overview of lead progression through key stages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Funnel Chart */}
          <div className="min-h-[300px] w-full" role="img" aria-label="Funnel chart showing lead progression through key stages: GTU Lead, Essential Course, Completed Essential, Advanced Course, Completed Advanced.">
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <Tooltip content={<ChartTooltipContent />} />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                  labelLine={false}
                  fill="#8884d8"
                >
                  <LabelList position="right" dataKey="name" fill="#000" stroke="none" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Stage Counts and Conversion Rates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stage Breakdown</h3>
            {stages.map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium">{stage.stage}</div>
                  <div className="text-2xl font-bold">{stage.count.toLocaleString()}</div>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-sm font-semibold text-primary">
                      {conversionRates[conversionRateKeys[index]]?.toFixed(1)}%
                    </span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Conversion</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}