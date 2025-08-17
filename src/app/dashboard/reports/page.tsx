"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { EventEnrollmentChart } from "@/components/dashboard/event-enrollment-chart";
import { InstrumentSalesChart } from "@/components/dashboard/instrument-sales-chart";
import { PipelineFunnel } from "@/components/dashboard/crm/pipeline-funnel";
import { UTMAnalysis } from "@/components/dashboard/crm/utm-analysis";
import { AutomatorLogTable } from "@/components/dashboard/crm/automator-log-table";
import { SalesRepLeaderboard } from "@/components/dashboard/crm/sales-rep-leaderboard";
import { AttributionDashboard } from "@/components/dashboard/marketing/attribution-dashboard";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface FunnelData {
  stages: Array<{ stage: string; count: number }>;
  conversion_rates: Record<string, number>;
}

interface UtmSource {
  source: string;
  leads: number;
  converted: number;
  revenue: number;
}

function CrmInsightsContent() {
  const { data: funnelData, isLoading: funnelLoading } = useQuery<FunnelData>({
    queryKey: ["crm-funnel"],
    queryFn: async () => {
      const res = await fetch("/api/crm/funnel");
      if (!res.ok) throw new Error("Failed to fetch funnel data");
      return res.json();
    },
  });

  const { data: utmData, isLoading: utmLoading } = useQuery<UtmSource[]>({
    queryKey: ["crm-utm"],
    queryFn: async () => {
      const res = await fetch("/api/crm/utm");
      if (!res.ok) throw new Error("Failed to fetch UTM data");
      const json = await res.json();
      return json.utm_sources;
    },
  });

  const isLoading = funnelLoading || utmLoading;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          {funnelData && (
            <PipelineFunnel
              stages={funnelData.stages}
              conversionRates={funnelData.conversion_rates}
            />
          )}
          {utmData && <UTMAnalysis data={utmData} />}
        </>
      )}
      <AutomatorLogTable />
      <SalesRepLeaderboard />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Insights</h1>
        <p className="text-muted-foreground">
          Analytical overview of events, sales, and CRM performance.
        </p>
      </div>
      <Tabs defaultValue="key-metrics">
        <TabsList>
          <TabsTrigger value="key-metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="crm-insights">CRM Insights</TabsTrigger>
          <TabsTrigger value="marketing-attribution">Marketing Attribution</TabsTrigger>
        </TabsList>
        <TabsContent value="key-metrics" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <SalesOverviewChart />
            </div>
            <EventEnrollmentChart />
            <InstrumentSalesChart />
          </div>
        </TabsContent>
        <TabsContent value="crm-insights" className="mt-4">
          <CrmInsightsContent />
        </TabsContent>
        <TabsContent value="marketing-attribution" className="mt-4">
          <AttributionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}