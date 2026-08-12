import React from 'react';
import { SectionTitle, Card } from '../components/ui.jsx';

export default function TeamAuditPage() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Team audit" subtitle="Team action history" />
      <Card className="p-5">
        <div className="text-sm text-slate-600">This page will call:</div>
        <ul className="list-disc ml-6 mt-2 text-sm text-slate-700">
          <li>GET /api/v1/teams/:teamId/audit-logs</li>
        </ul>
      </Card>
    </div>
  );
}

