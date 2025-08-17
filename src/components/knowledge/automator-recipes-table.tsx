"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

interface AutomatorRecipe {
  id: number;
  name: string;
  description: string;
}

const columns: ColumnDef<AutomatorRecipe>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Recipe Name" },
  { accessorKey: "description", header: "Description" },
];

async function fetchRecipes(): Promise<AutomatorRecipe[]> {
  const res = await fetch('/api/knowledge/automator-recipes');
  if (!res.ok) throw new Error('Failed to fetch Automator recipes');
  return res.json();
}

export function AutomatorRecipesTable() {
  const { data, isLoading } = useQuery<AutomatorRecipe[]>({
    queryKey: ['automator-recipes'],
    queryFn: fetchRecipes,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return <DataTable columns={columns} data={data || []} />;
}