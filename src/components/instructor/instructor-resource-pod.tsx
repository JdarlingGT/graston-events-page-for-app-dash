"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, ClipboardCheck } from "lucide-react";
import Link from "next/link";

const resources = [
  { name: "Class Sign-in Sheet", icon: ClipboardCheck, href: "/resources/sign-in-sheet.pdf" },
  { name: "Training Manual PDF", icon: BookOpen, href: "/resources/training-manual.pdf" },
  { name: "Skills Checklist Criteria", icon: ClipboardCheck, href: "/resources/skills-checklist.pdf" },
];

export function InstructorResourcePod() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructor Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map(resource => (
          <Button key={resource.name} asChild variant="outline" className="w-full justify-start">
            <Link href={resource.href} target="_blank" download>
              <resource.icon className="mr-2 h-4 w-4" />
              {resource.name}
              <Download className="ml-auto h-4 w-4" />
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}