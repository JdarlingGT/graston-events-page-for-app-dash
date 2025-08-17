"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, DollarSign, TrendingUp, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SalesRep {
  id: string;
  name: string;
  avatar?: string;
  assignedLeads: number;
  conversions: number;
  pipelineValue: number;
}

export function SalesRepLeaderboard() {
  const { data: salesReps = [], isLoading, error } = useQuery<SalesRep[]>({
    queryKey: ["sales-reps"],
    queryFn: async () => {
      const response = await fetch("/api/crm/sales-reps");
      if (!response.ok) throw new Error("Failed to fetch sales reps");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    toast.error("Failed to load sales rep data.");
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Team Performance</CardTitle>
          <CardDescription>Overview of individual sales representative metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading sales rep data.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort reps by conversions for leaderboard
  const sortedReps = [...salesReps].sort((a, b) => b.conversions - a.conversions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Team Performance</CardTitle>
        <CardDescription>Overview of individual sales representative metrics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedReps.map((rep, index) => (
          <div key={rep.id} className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={rep.avatar} />
                <AvatarFallback>{rep.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {index === 0 && (
                <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="col-span-2 font-semibold text-lg">{rep.name}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                Leads: {rep.assignedLeads}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Conversions: {rep.conversions}
              </div>
              <div className="flex items-center text-sm text-muted-foreground col-span-2">
                <DollarSign className="h-4 w-4 mr-1" />
                Pipeline Value: ${rep.pipelineValue.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}