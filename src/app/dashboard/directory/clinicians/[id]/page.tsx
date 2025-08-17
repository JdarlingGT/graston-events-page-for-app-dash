"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, User, MapPin } from "lucide-react";
import { VoucherManagement } from "@/components/directory/clinicians/voucher-management";

interface Clinician {
  id: string;
  name: string;
  email: string;
  specialty: string;
  location: string;
}

export default function ClinicianDetailPage({ params }: { params: { id: string } }) {
  const { data: clinician, isLoading } = useQuery<Clinician>({
    queryKey: ["clinician", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/clinicians/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch clinician details");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!clinician) {
    return <p>Clinician not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{clinician.name}</CardTitle>
          <CardDescription>{clinician.specialty}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {clinician.email}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {clinician.location}</div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vouchers">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="history">Training History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <p>Overview coming soon.</p>
        </TabsContent>
        <TabsContent value="vouchers" className="mt-4">
          <VoucherManagement clinicianId={clinician.id} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <p>Training history coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}