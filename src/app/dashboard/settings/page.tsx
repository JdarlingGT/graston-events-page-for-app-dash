'use client';

import { Button } from '@/components/ui/button';
import WithAuth from '@/components/withAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import TeamManagement from '@/components/dashboard/settings/TeamManagement';

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations.
        </p>
      </div>
      <Tabs defaultValue="integrations">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <p className="text-muted-foreground">Profile settings coming soon.</p>
        </TabsContent>
        <TabsContent value="appearance" className="mt-4">
          <p className="text-muted-foreground">Appearance settings coming soon.</p>
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Google Workspace</CardTitle>
                  <CardDescription>
                    Connect your account to sync tasks with Google Calendar and receive Gmail notifications.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">
                  Connect your Google account to enable calendar and email features.
                </p>
                <Button asChild>
                  <Link href="/api/auth/google">Connect to Google Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}