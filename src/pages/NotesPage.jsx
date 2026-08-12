import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { Button, Card, Input, Label, SectionTitle, Textarea } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';
import { Link } from 'react-router-dom';

function NoteList({ title, subtitle, notes, loading, renderRight }) {
  return (
    <div className="rounded-3xl bg-white/35 border border-white/60 shadow-soft p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-slate-600 mt-1">{subtitle}</div> : null}
        </div>
        {renderRight ? renderRight() : null}
      </div>

      {loading ? (
        <div className="text-slate-600 text-sm">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-slate-600 text-sm">No notes.</div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <Link
              key={n.id}
              to={`/notes/${n.id}`}
              className="block rounded-2xl bg-white/45 border border-white/60 p-4 shadow-soft hover:bg-white/60 transition bb3d-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium leading-tight truncate">{n.title}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Updated: {n.updatedAt ? new Date(n.updatedAt).toLocaleString() : '—'}
                  </div>
                </div>
                {n.permission ? (
                  <div className="shrink-0 text-[11px] px-2 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-800">
                    {n.permission}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  const { toast } = useToast();

  const [ownNotes, setOwnNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [leftTab, setLeftTab] = useState('notes'); // notes | shared

  const counts = useMemo(
    () => ({ own: ownNotes.length, shared: sharedNotes.length }),
    [ownNotes.length, sharedNotes.length]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getNotes();
        setOwnNotes(res?.data?.ownNotes || res?.ownNotes || []);
        setSharedNotes(res?.data?.sharedNotes || res?.sharedNotes || []);
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load notes' });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const list = leftTab === 'notes' ? ownNotes : sharedNotes;
    if (!selectedId && list && list.length > 0) {
      setSelectedId(list[0].id);
    }
  }, [leftTab, ownNotes, sharedNotes, selectedId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedId) return;
      try {
        const res = await api.getNoteById(selectedId);
        const data = res?.data || res;
        if (cancelled) return;
        setSelectedNote(data);
        setEditorTitle(data?.title || '');
        setEditorContent(data?.content || '');
      } catch (err) {
        if (cancelled) return;
        toast({ type: 'error', message: err.message || 'Failed to load note' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, toast]);

  async function createNote(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createNote({ title, content });
      toast({ type: 'success', message: 'Note created' });
      setTitle('');
      setContent('');
      const res = await api.getNotes();
      setOwnNotes(res?.data?.ownNotes || []);
      setSharedNotes(res?.data?.sharedNotes || []);
      setLeftTab('notes');
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Create failed' });
    } finally {
      setCreating(false);
    }
  }

  const activeList = leftTab === 'notes' ? ownNotes : sharedNotes;
  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeList;
    return activeList.filter((n) => (n.title || '').toLowerCase().includes(q));
  }, [activeList, search]);

  const canEdit = !!selectedNote && (selectedNote.permission === 'edit' || selectedNote.role === 'owner');

  async function saveEditor() {
    if (!selectedId || !canEdit) return;
    setSaving(true);
    try {
      await api.updateNote(selectedId, { title: editorTitle, content: editorContent });
      toast({ type: 'success', message: 'Saved' });

      const [noteRes, listsRes] = await Promise.all([api.getNoteById(selectedId), api.getNotes()]);
      const noteData = noteRes?.data || noteRes;
      setSelectedNote(noteData);
      setEditorTitle(noteData?.title || '');
      setEditorContent(noteData?.content || '');

      setOwnNotes(listsRes?.data?.ownNotes || []);
      setSharedNotes(listsRes?.data?.sharedNotes || []);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  }

  async function delSelected() {
    if (!selectedId) return;
    if (!confirm('Delete this note?')) return;

    try {
      await api.deleteNote(selectedId);
      toast({ type: 'success', message: 'Deleted' });

      const lists = await api.getNotes();
      setOwnNotes(lists?.data?.ownNotes || []);
      setSharedNotes(lists?.data?.sharedNotes || []);

      setSelectedId(null);
      setSelectedNote(null);
      setEditorTitle('');
      setEditorContent('');
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Delete failed' });
    }
  }

  return (
    <div className="w-screen h-screen">
      <div className="h-full w-full grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-5 p-4">
        {/* Left: Create + List */}
        <div className="flex flex-col gap-5 min-w-0">
          <Card className="p-4 bb3d">
            <div className="space-y-4">
              <div>
                <SectionTitle title="Notes" subtitle="Create, search, and edit your notes" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." />
                <Button type="button" variant="secondary" onClick={() => setSearch('')}>
                  Clear
                </Button>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  type="button"
                  variant={leftTab === 'notes' ? 'primary' : 'secondary'}
                  onClick={() => setLeftTab('notes')}
                >
                  Notes <span className="ml-2 text-xs opacity-80">{counts.own}</span>
                </Button>
                <Button
                  type="button"
                  variant={leftTab === 'shared' ? 'primary' : 'secondary'}
                  onClick={() => setLeftTab('shared')}
                >
                  Shared <span className="ml-2 text-xs opacity-80">{counts.shared}</span>
                </Button>
              </div>

              <form onSubmit={createNote} className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label>New title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} placeholder="e.g. Meeting notes" />
                  </div>
                  <div>
                    <Label>New content</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={50000} placeholder="Write something..." />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">Tip: share after saving. </div>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <div className="flex-1 min-h-0 overflow-auto">
            <NoteList
              title={leftTab === 'notes' ? 'Your notes' : 'Shared with you'}
              subtitle={leftTab === 'notes' ? 'Private notes you own' : 'Notes shared by others'}
              notes={filteredNotes}
              loading={loading}
              renderRight={() => (
                <div className="shrink-0 text-[11px] px-2 py-1 rounded-full bg-white/50 border border-white/70 text-slate-500">
                  {filteredNotes.length}
                </div>
              )}
            />
          </div>
        </div>


      </div>
    </div>
  );
}

