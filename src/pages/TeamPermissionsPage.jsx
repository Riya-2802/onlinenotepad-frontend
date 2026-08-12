import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Button, Card, Input, Label, SectionTitle } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';

export default function TeamPermissionsPage() {
  const { teamId } = useParams();
  const { toast } = useToast();

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(''); // kept for compatibility, not used in API call

  const [permissionQuery, setPermissionQuery] = useState('');
  const [selectedActions, setSelectedActions] = useState(new Set());
  const [saving, setSaving] = useState(false);

  // We only have a GET /permissions and role-based permissions UI in this simplified frontend.
  // Backend role endpoints use roleName (not roleId) for permission assignment.
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getAllPermissions();
        setPermissions(res?.data || res || []);
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load permissions' });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  useEffect(() => {
    (async () => {
      setRolesLoading(true);
      try {
        const res = await api.getTeamRoles(teamId);
        const data = res?.data || res || [];
        setRoles(data);

        // Initialize dropdown with first role
        if (!selectedRoleName && data?.[0]?.name) {
          setSelectedRoleName(data[0].name);
          setSelectedRoleId(String(data[0].id ?? ''));
        }
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load roles' });
      } finally {
        setRolesLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, toast]);

  const selectedRole = roles.find((r) => r.name === selectedRoleName);



  const filtered = permissions.filter((p) => {
    const action = p?.action || '';
    const q = permissionQuery.trim().toLowerCase();
    if (!q) return true;
    return action.toLowerCase().includes(q);
  });

  function toggleAction(action) {m
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
  }

  async function savePermissions() {
    if (!selectedRole?.name) {
      toast({ type: 'error', message: 'Select a role first' });
      return;
    }
    if (selectedActions.size === 0) {
      toast({ type: 'error', message: 'Select at least one permission action' });
      return;
    }

    setSaving(true);
    try {
      const actions = Array.from(selectedActions);
      await api.addPermissionsToRole(teamId, selectedRole.name, { permissions: actions });
      toast({ type: 'success', message: 'Permissions added to role' });
      setSelectedActions(new Set());

      const res = await api.getTeamRoles(teamId);
      setRoles(res?.data || res || []);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Failed to update permissions' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Team permissions" subtitle="Assign permission actions to roles" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex-1 min-w-[240px]">
                <Label>Role</Label>
                <select
                  value={selectedRoleName}

                  onChange={(e) => {
                    setSelectedRoleName(e.target.value);
                    setSelectedActions(new Set());
                  }}
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-purple-100"
                  disabled={rolesLoading}
                >
                  {rolesLoading ? (
                    <option value="">Loading roles...</option>
                  ) : (
                    roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex-1 min-w-[220px]">
                <Label>Search permission</Label>
                <Input
                  value={permissionQuery}
                  onChange={(e) => setPermissionQuery(e.target.value)}
                  placeholder="e.g. NOTE_ or team:" 
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            {loading ? (
              <div className="text-slate-600">Loading permissions...</div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">Pick actions to add to selected role</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filtered.length === 0 ? (
                    <div className="col-span-2 text-sm text-slate-600">No permissions found.</div>
                  ) : (
                    filtered.map((p) => {
                      const action = p?.action;
                      if (!action) return null;
                      const checked = selectedActions.has(action);
                      return (
                        <button
                          type="button"
                          key={p.id || action}
                          onClick={() => toggleAction(action)}
                          className={`text-left px-4 py-3 rounded-2xl border shadow-soft transition ${
                            checked
                              ? 'bg-purple-600 text-white border-purple-200'
                              : 'bg-white/60 hover:bg-white/75 border-white/70 text-slate-800'
                          }`}
                        >
                          <div className="font-medium text-sm">{action}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </Card>

        </div>


        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle title="Selected" subtitle="Actions to add" />
            <div className="mt-3 space-y-2">
              {selectedActions.size === 0 ? (
                <div className="text-sm text-slate-600">Nothing selected.</div>
              ) : (
                Array.from(selectedActions).map((a) => (
                  <div key={a} className="text-sm px-3 py-2 rounded-2xl bg-purple-600/10 border border-purple-200 text-purple-700">
                    {a}
                  </div>
                ))
              )}
            </div>

            <Button
              onClick={savePermissions}
              disabled={saving || !selectedRole}
              className="mt-5 w-full bg-purple-600 hover:bg-purple-700 text-black border border-purple-200 shadow-3d"
            >
              {saving ? 'Saving...' : 'Add permissions to role'}
            </Button>
          </Card>

          <Card className="p-5">
            <div className="text-xs text-slate-600">Current role actions (read-only)</div>
            <div className="mt-3 text-sm text-slate-800">
              {selectedRole?.permissions ? (
                <div className="break-words">
                  {String(selectedRole.permissions).replace(/\[|\]|"/g, '')}
                </div>
              ) : (
                <div className="text-slate-600">—</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


