'use client';

import { ArchivalSearch } from '@/components/dashboard/archival-search/archival-search';

export default function ArchivalSearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>RDS Archival Search</h1>
        <p className="text-muted-foreground">
          Search historical data from the read-only RDS database archive.
        </p>
      </div>
      <ArchivalSearch />
    </div>
  );
}