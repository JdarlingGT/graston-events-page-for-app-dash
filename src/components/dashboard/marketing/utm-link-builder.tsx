"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export function UtmLinkBuilder() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  useEffect(() => {
    const buildUrl = () => {
      if (!url) {
        setGeneratedUrl("");
        return;
      }
      const urlObject = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (source) urlObject.searchParams.set("utm_source", source);
      if (medium) urlObject.searchParams.set("utm_medium", medium);
      if (campaign) urlObject.searchParams.set("utm_campaign", campaign);
      setGeneratedUrl(urlObject.toString());
    };
    buildUrl();
  }, [url, source, medium, campaign]);

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success("UTM link copied to clipboard!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          UTM Link Builder
        </CardTitle>
        <CardDescription>
          Create consistent, trackable URLs for your campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-url">Website URL</Label>
          <Input id="base-url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="utm-source">Source</Label>
            <Input id="utm-source" placeholder="e.g., google" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utm-medium">Medium</Label>
            <Input id="utm-medium" placeholder="e.g., cpc" value={medium} onChange={(e) => setMedium(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utm-campaign">Campaign</Label>
            <Input id="utm-campaign" placeholder="e.g., summer_sale" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2 pt-4">
          <Label>Generated URL</Label>
          <div className="relative">
            <Input readOnly value={generatedUrl} className="pr-10" />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-1/2 right-1.5 transform -translate-y-1/2 h-7 w-7"
              onClick={handleCopy}
              disabled={!generatedUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}