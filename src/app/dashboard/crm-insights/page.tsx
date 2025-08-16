"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FunnelHealth } from "../../../components/dashboard/crm/funnel-health";
import { LeadAnalysis } from "../../../components/dashboard/crm/lead-analysis";
import { ActivityLog } from "../../../components/dashboard/crm/activity-log";

export default function CrmInsightsPage() {
  const [funnelData, setFunnelData] = useState<any>(null);
  const [utmData, setUtmData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [funnelRes, utmRes, activityRes] = await Promise.all([
          fetch("/api/crm/funnel"),
          fetch("/api/crm/utm"),
          fetch("/api/crm/activity"),
        ]);

        if (!funnelRes.ok || !utmRes.ok || !activityRes.ok) {
          throw new Error("Failed to fetch CRM data");
        }

        const funnelJson = await funnelRes.json();
        const utmJson = await utmRes.json();
        const activityJson = await activityRes.json();

        setFunnelData(funnelJson);
        setUtmData(utmJson);
        setActivityData(activityJson);
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
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96 lg:col-span-3" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {funnelData && (
            <FunnelHealth
              stages={funnelData.stages}
              conversionRates={funnelData.conversion_rates}
            />
          )}
          {utmData && <LeadAnalysis data={utmData.utm_sources} />}
          {activityData && <ActivityLog data={activityData} />}
        </div>
      )}
    </div>
  );
}