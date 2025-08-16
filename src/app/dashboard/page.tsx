import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to your Command Center!</CardTitle>
        <CardDescription>
          This is your central hub for managing all event operations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Select a module from the sidebar to get started.</p>
      </CardContent>
    </Card>
  );
}