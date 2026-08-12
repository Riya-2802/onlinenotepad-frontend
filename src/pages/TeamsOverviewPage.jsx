import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Card, Button, Input, Label, SectionTitle } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';
import { Link } from 'react-router-dom';

function TeamIcon({ name }) {
  const initials = (name || 'T')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="w-10 h-10 rounded-2xl bg-white/70 shadow-3d border border-white/70 flex items-center justify-center text-sm font-semibold text-purple-700">
      {initials || 'T'}
    </div>
  );
}

export default function TeamsOverviewPage() {
  const { toast } = useToast();

  const [teams, setTeams] = useState({ ownedTeams: [], memberTeams: [] });
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getTeams();
        setTeams(res?.data || res || { ownedTeams: [], memberTeams: [] });
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load teams' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createTeam(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createTeam({ name });
      toast({ type: 'success', message: 'Team created' });
      setName('');
      const res = await api.getTeams();
      setTeams(res?.data || res);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Create team failed' });
    } finally {
      setCreating(false);
    }
  }

  const list = [...(teams.ownedTeams || []), ...(teams.memberTeams || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <SectionTitle title="Teams" subtitle="Workspaces with roles, permissions & members" />
        </div>

        <form onSubmit={createTeam} className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <Label>Team name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <Button
            type="submit"
            disabled={creating}
            className="mt-6 bg-black hover:bg-slate-900 text-black border border-slate-200 shadow-3d"
          >
            {creating ? 'Creating...' : 'Create Team'}
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { title: 'Owned', items: teams.ownedTeams || [] },
            { title: 'Member', items: teams.memberTeams || [] },
          ].map(({ title, items }) => (
            <Card key={title} className="p-4">
              <div className="font-semibold text-sm">{title}</div>
              <div className="mt-3 space-y-2">
                {items.length === 0 ? (
                  <div className="text-sm text-slate-600">No {title.toLowerCase()} teams.</div>
                ) : (
                  items.map((t) => (
                    <Link key={t.id} to={`/teams/${t.id}`} className="block">
                      <div className="rounded-3xl bg-white/60 border border-white/70 p-4 shadow-soft bb3d-hover hover:bg-white/75 transition flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <TeamIcon name={t.name} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{t.name}</div>
                            {'roleName' in t ? (
                              <div className="text-xs text-slate-600 mt-1 truncate">Role: {t.roleName}</div>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 bg-white/70 border border-white/80 rounded-2xl px-3 py-2 shadow-soft">
                          {t.membersCount ?? '—'}
                          <div className="text-[10px] leading-3">Members</div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          ))}

          {list.length === 0 ? (
            <div className="lg:col-span-2 text-slate-600 text-sm">No teams yet.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

