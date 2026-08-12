import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Button, Card, Input, Label, SectionTitle, Textarea } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sharing state
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [shares, setShares] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [updatingPermissionToken, setUpdatingPermissionToken] = useState(null);
  const [revokingToken, setRevokingToken] = useState(null);

  const canEdit = !!note && (note.permission === 'edit' || note.role === 'owner' || !note.permission);
  const shareControlsEnabled = canEdit;

  // Effect #1: load note
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        // If opened from SharedPage, location.state already contains the correct note fields.
        // Avoid overwriting with backend response shape mismatches.
        const hasNavState = !!useLocation?.state;
        if (locationState?.title && locationState?.content) {
          setNote((prev) => prev || locationState);
        } else {
          const res = await api.getNoteById(id);
          const data = res?.data || res;
          if (cancelled) return;
          setNote(data);
        }
      } catch (err) {
        if (cancelled) return;
        toast({ type: 'error', message: err.message || 'Failed to load note' });
        navigate('/notes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, toast]);

  // Effect #2: load shares (always declared; internally decides what to do)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!note || !shareControlsEnabled) {
        setShares([]);
        setSharesLoading(false);
        return;
      }

      setSharesLoading(true);
      try {
        const res = await api.getSharesForNote(id);
        const list = res?.data || res || [];
        if (cancelled) return;
        setShares(list);
      } catch (err) {
        if (cancelled) return;
        toast({ type: 'error', message: err.message || 'Failed to load share links' });
        setShares([]);
      } finally {
        if (!cancelled) setSharesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, note, shareControlsEnabled, toast]);

  const title = note?.title || '';
  const content = note?.content || '';

  async function save(e) {
    e.preventDefault();
    if (!shareControlsEnabled && note?.permission !== 'edit' && note?.role !== 'owner' && note?.permission) return;
    setSaving(true);
    try {
      await api.updateNote(id, { title, content });
      toast({ type: 'success', message: 'Saved' });
      const res = await api.getNoteById(id);
      setNote(res?.data || res);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirm('Delete this note?')) return;
    try {
      await api.deleteNote(id);
      toast({ type: 'success', message: 'Deleted' });
      navigate('/notes');
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Delete failed' });
    }
  }

  async function refreshShares() {
    if (!note || !shareControlsEnabled) return;
    setSharesLoading(true);
    try {
      const res = await api.getSharesForNote(id);
      setShares(res?.data || res || []);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Failed to refresh share links' });
    } finally {
      setSharesLoading(false);
    }
  }

  async function handleShare(e) {
    e.preventDefault();
    if (!shareControlsEnabled) return;

    const emailId = (shareEmail || '').toLowerCase().trim();
    if (!emailId) {
      toast({ type: 'error', message: 'Email is required' });
      return;
    }

    if (!['view', 'edit'].includes(sharePermission)) {
      toast({ type: 'error', message: "Permission must be 'view' or 'edit'" });
      return;
    }

    setSharing(true);
    try {
      await api.shareNote(id, { emailId, permission: sharePermission });
      toast({ type: 'success', message: 'Share created' });
      setShareEmail('');
      setSharePermission('view');
      await refreshShares();
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Share failed' });
    } finally {
      setSharing(false);
    }
  }

  async function updatePermission(token, permission) {
    if (!shareControlsEnabled) return;
    setUpdatingPermissionToken(token);

    try {
      await api.updateSharePermission(token, { permission });
      toast({ type: 'success', message: 'Permission updated' });
      await refreshShares();
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Permission update failed' });
    } finally {
      setUpdatingPermissionToken(null);
    }
  }

  async function revoke(token) {
    if (!shareControlsEnabled) return;
    setRevokingToken(token);

    try {
      await api.revokeShare(token);
      toast({ type: 'success', message: 'Access revoked' });
      await refreshShares();
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Revoke failed' });
    } finally {
      setRevokingToken(null);
    }
  }

  const shareActionLabel = useMemo(() => {
    if (!shareControlsEnabled) return 'Sharing disabled';
    return 'Share this note';
  }, [shareControlsEnabled]);

  const locationState = useLocation()?.state;

  // Early returns are AFTER hooks
  if (loading && !locationState) return <div className="text-slate-600">Loading...</div>;

  // Allow instant render from navigation state (used by SharedPage)
  const resolvedTitle = note?.title ?? locationState?.title ?? '';
  const resolvedContent = note?.content ?? locationState?.content ?? '';
  const resolvedPermission = note?.permission ?? locationState?.permission;
  const resolvedRole = note?.role ?? locationState?.role;

  const displayPermission = resolvedPermission;
  const displayRole = resolvedRole;
  const canEditFromResolved = !!displayPermission
    ? (displayPermission === 'edit' || displayRole === 'owner')
    : true;

  return (
    <div className="space-y-6">
      <SectionTitle title="Note" subtitle={`#${id}`} />

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-600">Role/Permission</div>
            <div className="text-lg font-semibold mt-1">
              {note?.permission ? `Permission: ${note.permission}` : 'Owner'}
            </div>
          </div>
          {shareControlsEnabled ? (
            <Button variant="danger" onClick={del} className="shrink-0">
              Delete
            </Button>
          ) : null}
        </div>

        <form onSubmit={save} className="mt-5 space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setNote((prev) => ({ ...prev, title: e.target.value }))}
              disabled={!shareControlsEnabled}
              required
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setNote((prev) => ({ ...prev, content: e.target.value }))}
              disabled={!shareControlsEnabled}
            />
          </div>
          <Button type="submit" disabled={!shareControlsEnabled || saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-600">Sharing</div>
            <div className="text-lg font-semibold mt-1">Share this note</div>
          </div>
          {!shareControlsEnabled ? (
            <div className="text-sm text-slate-600">You have view-only access</div>
          ) : null}
        </div>

        <form onSubmit={handleShare} className="mt-5 space-y-3">
          <div>
            <Label>Share with (email)</Label>
            <Input
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              disabled={!shareControlsEnabled || sharing}
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <Label>Permission</Label>
            <select
              className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              disabled={!shareControlsEnabled || sharing}
            >
              <option value="view">view</option>
              <option value="edit">edit</option>
            </select>
          </div>

          <Button type="submit" disabled={!shareControlsEnabled || sharing}>
            {sharing ? 'Sharing...' : shareActionLabel}
          </Button>
        </form>

        <div className="mt-6">
          <div className="text-sm text-slate-600">Shared with</div>

          {sharesLoading ? (
            <div className="text-slate-600 mt-2">Loading share links...</div>
          ) : shares.length === 0 ? (
            <div className="text-slate-600 mt-2">No share links yet.</div>
          ) : (
            <div className="space-y-3 mt-3">
              {shares.map((s) => (
                <div key={s.token} className="border border-slate-200 rounded-md p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {s.sharedWithUserId?.emailId
                          ? s.sharedWithUserId.emailId
                          : s.emailId || s.sharedWithEmail || 'Shared user'}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">Permission: {s.permission}</div>
                      {s.shareLink ? (
                        <div className="text-xs text-slate-600 mt-2 break-all">Link: {s.shareLink}</div>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                          value={s.permission}
                          disabled={!shareControlsEnabled || updatingPermissionToken === s.token}
                          onChange={(e) => updatePermission(s.token, e.target.value)}
                        >
                          <option value="view">view</option>
                          <option value="edit">edit</option>
                        </select>
                      </div>

                      <Button
                        variant="danger"
                        size="sm"
                        disabled={!shareControlsEnabled || revokingToken === s.token}
                        onClick={() => revoke(s.token)}
                      >
                        {revokingToken === s.token ? 'Revoking...' : 'Revoke'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

