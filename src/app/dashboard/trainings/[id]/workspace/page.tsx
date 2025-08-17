import { LiveTrainingWorkspace } from "@/components/instructor-workspace/live-training-workspace";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TrainingWorkspacePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="w-fit">
        <Link href="/dashboard/instructor">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Dashboard
        </Link>
      </Button>
      <LiveTrainingWorkspace eventId={params.id} />
    </div>
  );
}