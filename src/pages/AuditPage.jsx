import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Card } from '../components/ui.jsx';

export default function AuditPage() {
  const [account, setAccount] = useState([]);
  const [notes, setNotes] = useState([]);
  const [shared, setShared] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const a = await api.getAuditLogsAccount(50);
        const n = await api.getAuditLogsNotes(50);
        const s = await api.getAuditLogsShared(50);
        setAccount(a?.data || a || []);
        setNotes(n?.data || n || []);
        setShared(s?.data || s || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="text-2xl font-semibold">Audit logs</div>
      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-4">
            <div className="font-semibold text-sm">Account</div>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              {account.slice(0, 12).map((x, i) => (
                <div key={i} className="rounded-xl bg-white/40 border border-white/60 p-2">
                  <div className="font-medium">{x.action || x.type || x.eventType}</div>
                  <div className="text-slate-600">{new Date(x.createdAt || x.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <div className="font-semibold text-sm">Notes</div>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              {notes.slice(0, 12).map((x, i) => (
                <div key={i} className="rounded-xl bg-white/40 border border-white/60 p-2">
                  <div className="font-medium">{x.action || x.type || x.eventType}</div>
                  <div className="text-slate-600">{new Date(x.createdAt || x.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <div className="font-semibold text-sm">Shared</div>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              {shared.slice(0, 12).map((x, i) => (
                <div key={i} className="rounded-xl bg-white/40 border border-white/60 p-2">
                  <div className="font-medium">{x.action || x.type || x.eventType}</div>
                  <div className="text-slate-600">{new Date(x.createdAt || x.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

