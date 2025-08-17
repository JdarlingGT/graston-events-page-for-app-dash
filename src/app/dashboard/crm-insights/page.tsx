"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PipelineFunnel } from "../../../components/dashboard/crm/pipeline-funnel";
import { UTMAnalysis } from "../../../components/dashboard/crm/utm-analysis";
import { AutomatorLogTable } from "../../../components/dashboard/crm/automator-log-table";
import { SalesRepLeaderboard } from "../../../components/dashboard/crm/sales-rep-leaderboard";

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

export default function CrmInsightsPage() {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [utmData, setUtmData] = useState<UtmSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [funnelRes, utmRes] = await Promise.all([
          fetch("/api/crm/funnel"),
          fetch("/api/crm/utm"),
        ]);

        if (!funnelRes.ok || !utmRes.ok) {
          throw new Error("Failed to fetch CRM data");
        }

        const funnelJson = await funnelRes.json();
        const utmJson = await utmRes.json();

        setFunnelData(funnelJson);
        setUtmData(utmJson.utm_sources); // Assuming utm_sources is an array
      } catch (error) {
        console.error(error);
        toast.error("Failed to load CRM Insights data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM Insights</h1>
        <p className="text-muted-foreground">
          Monitor lead health, funnels, and activity logs in real time.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" /> {/* Placeholder for PipelineFunnel */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Skeleton className="h-96 lg:col-span-2" /> {/* Placeholder for UTMAnalysis */}
            <Skeleton className="h-96 lg:col-span-3" /> {/* Placeholder for UTMAnalysis */}
          </div>
          <Skeleton className="h-96 w-full" /> {/* Placeholder for AutomatorLogTable */}
          <Skeleton className="h-64 w-full" /> {/* Placeholder for SalesRepLeaderboard */}
        </div>
      ) : (
        <div className="space-y-4">
          {funnelData && (
            <PipelineFunnel
              stages={funnelData.stages}
              conversionRates={funnelData.conversion_rates}
            />
          )}
          {utmData && <UTMAnalysis data={utmData} />}
          <AutomatorLogTable />
          <SalesRepLeaderboard />
        </div>
      )}
    </div>
  );
}