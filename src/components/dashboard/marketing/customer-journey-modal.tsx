"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MousePointer, Mail, ShoppingCart } from "lucide-react";

interface JourneyStep {
  type: "Ad Click" | "Page View" | "Email Open" | "Purchase";
  title: string;
  timestamp: string;
}

const mockJourney: JourneyStep[] = [
  { type: "Ad Click", title: "Google Ad: 'Advanced React Training'", timestamp: "2024-07-15 09:32 AM" },
  { type: "Page View", title: "Visited Landing Page", timestamp: "2024-07-15 09:33 AM" },
  { type: "Email Open", title: "Opened 'Webinar Reminder' Email", timestamp: "2024-07-18 02:15 PM" },
  { type: "Purchase", title: "Purchased: Advanced React Patterns Workshop", timestamp: "2024-07-20 11:45 AM" },
];

const getIcon = (type: JourneyStep["type"]) => {
  switch (type) {
    case "Ad Click": return <MousePointer className="h-5 w-5" />;
    case "Page View": return <ArrowRight className="h-5 w-5" />;
    case "Email Open": return <Mail className="h-5 w-5" />;
    case "Purchase": return <ShoppingCart className="h-5 w-5" />;
    default: return <div className="h-5 w-5" />;
  }
};

export function CustomerJourneyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer Journey Timeline</DialogTitle>
          <DialogDescription>
            Full sequence of touchpoints for Order #12345.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-8">
            {mockJourney.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getIcon(step.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.timestamp}</p>
                </div>
                <Badge variant={step.type === "Purchase" ? "default" : "outline"}>
                  {step.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}