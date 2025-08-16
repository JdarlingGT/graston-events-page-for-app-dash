"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users } from "lucide-react";

interface Stage {
  stage: string;
  count: number;
}

interface FunnelHealthProps {
  stages: Stage[];
  conversionRates: Record<string, number>;
}

const conversionRateKeys = [
  "GTU_to_Essential",
  "Essential_to_Completed",
  "Completed_to_Advanced",
  "Advanced_to_Completed",
];

export function FunnelHealth({ stages, conversionRates }: FunnelHealthProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel & Pipeline Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stages.map((stage, index) => (
            <div key={stage.stage} className="flex items-center">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stage.stage}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stage.count.toLocaleString()}</div>
                </CardContent>
              </Card>
              {index < stages.length - 1 && (
                <div className="mx-4 flex flex-col items-center">
                  <span className="text-sm font-semibold text-primary">
                    {conversionRates[conversionRateKeys[index]]?.toFixed(2)}%
                  </span>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}