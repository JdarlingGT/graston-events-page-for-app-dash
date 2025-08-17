"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CrmTagsTable } from "../../../../components/knowledge/crm-tags-table";
import { AutomatorRecipesTable } from "../../../../components/knowledge/automator-recipes-table";
import { GravityFormsTable } from "../../../../components/knowledge/gravity-forms-table";
import { AcfFieldsTable } from "../../../../components/knowledge/acf-fields-table";

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Knowledge Base</h1>
        <p className="text-muted-foreground">
          An internal reference for our backend systems and automations.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FluentCRM Tags</CardTitle>
            <CardDescription>Key tags used for student segmentation and automation.</CardDescription>
          </CardHeader>
          <CardContent>
            <CrmTagsTable />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Automator Recipes</CardTitle>
            <CardDescription>Core automation workflows connecting our systems.</CardDescription>
          </CardHeader>
          <CardContent>
            <AutomatorRecipesTable />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gravity Forms</CardTitle>
            <CardDescription>Forms used for lead capture and inquiries.</CardDescription>
          </CardHeader>
          <CardContent>
            <GravityFormsTable />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ACF Field Groups</CardTitle>
            <CardDescription>Custom fields used for storing event and course data.</CardDescription>
          </CardHeader>
          <CardContent>
            <AcfFieldsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}