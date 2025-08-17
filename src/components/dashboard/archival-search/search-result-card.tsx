"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SearchResult } from "./archival-search";

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            <Link href="#" className="hover:underline">
              {result.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="capitalize">{result.type}</Badge>
        </div>
        <CardDescription>
          {new Date(result.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {result.description}
        </p>
      </CardContent>
    </Card>
  );
}