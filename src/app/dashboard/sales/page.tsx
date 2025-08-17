"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { SalesRepLeaderboard } from "@/components/dashboard/crm/sales-rep-leaderboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingUp, Users, DollarSign } from "lucide-react";
import Link from "next/link";

export default function SalesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Command Center</h1>
        <p className="text-muted-foreground">
          Monitor team performance and launch targeted outreach campaigns.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="New Leads (Month)" value="1,250" icon={Users} />
        <StatCard title="Conversion Rate" value="12.5%" icon={TrendingUp} />
        <StatCard title="Pipeline Value" value="$250,000" icon={DollarSign} />
        <StatCard title="Top Event" value="Essential NYC" icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesRepLeaderboard />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target />
              Intelligent Sales Targeting
            </CardTitle>
            <CardDescription>
              Generate targeted lead lists for upcoming events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the AI Outreach Co-Pilot to find high-potential providers and generate personalized emails to drive registrations.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/sales/targeting">
                Open Sales Targeting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}