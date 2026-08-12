import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Card } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';
import { Link } from 'react-router-dom';

export default function SharedPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getSharedNotes();
        setNotes(res?.data || res || []);
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load shared notes' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="text-2xl font-semibold">Shared with me</div>
      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-slate-600">No shared notes.</div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <Card key={n.token || n.id} className="p-4">
              <Link
                to={`/notes/${n.id}`}
                state={{
                  title: n.title,
                  content: n.content,
                  permission: n.permission,
                  role: n.role || (n.permission ? 'shared' : 'owner'),
                }}
                className="block"
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-slate-600 mt-1">Permission: {n.permission}</div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

