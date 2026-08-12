import React, { useEffect, useMemo, useState } from 'react';

import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Card, Button, Input, Label, SectionTitle } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';
import NotesPage from './NotesPage.jsx';

import TeamPermissionsPage from './TeamPermissionsPage.jsx';



function Avatar({ name }) {
  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-200 shadow-soft flex items-center justify-center font-semibold text-purple-700">
      {initials}
    </div>
  );
}

export default function TeamDetailsPage() {
  const { teamId } = useParams();
  const { toast } = useToast();

  const [team, setTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('members');


  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesRawLoading, setRolesRawLoading] = useState(true);

  // Invite member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviting, setInviting] = useState(false);

  // Create role (Roles tab)
  const [roleName, setRoleName] = useState('');
  const [creatingRole, setCreatingRole] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getTeamDetails(teamId);
        setTeam(res?.data || res);
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load team' });
      }
    })();
  }, [teamId, toast]);

  useEffect(() => {
    (async () => {
      setMembersLoading(true);
      try {
        const res = await api.getTeamMembers(teamId);
        setMembers(res?.data || res || []);
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load members' });
      } finally {
        setMembersLoading(false);
      }
    })();
  }, [teamId, toast]);

  useEffect(() => {
    (async () => {
      setRolesLoading(true);
      setRolesRawLoading(true);
      try {
        const res = await api.getTeamRoles(teamId);
        const data = res?.data || res || [];
        setRoles(data);
        if (!inviteRoleId && data?.[0]?.id !== undefined) setInviteRoleId(String(data[0].id));
      } catch (err) {
        toast({ type: 'error', message: err.message || 'Failed to load roles' });
      } finally {
        setRolesLoading(false);
        setRolesRawLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const roleIdOptions = useMemo(() => {
    return (roles || [])
      .filter((r) => r?.id !== undefined && r?.id !== null)
      .map((r) => ({ id: r.id, label: r.name }));
  }, [roles]);

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    if (!inviteRoleId) return;

    setInviting(true);
    try {
      const emailId = inviteEmail.trim().toLowerCase();
      const roleId = Number(inviteRoleId);

      await api.inviteMember(teamId, { emailId, roleId });
      toast({ type: 'success', message: 'Invite sent' });
      setInviteEmail('');

      const res = await api.getTeamMembers(teamId);
      setMembers(res?.data || res || []);
    } catch (err) {
      const status = err?.status || err?.payload?.status;
      const msg = err?.message || err?.payload?.message;

      // Most common backend 500 cause for this endpoint: email not found in users table.
      if (status === 500) {
        toast({
          type: 'error',
          message: msg || 'Invite failed. Make sure the user email already exists (signed up) before inviting.'
        });
        return;
      }

      toast({ type: 'error', message: msg || 'Invite failed' });
    } finally {
      setInviting(false);
    }
  }


  async function handleRemoveMember(userId) {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      await api.removeMember(teamId, userId);
      toast({ type: 'success', message: 'Member removed' });
      const res = await api.getTeamMembers(teamId);
      setMembers(res?.data || res || []);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Remove failed' });
    }
  }

  async function handleChangeMemberRole(userId, nextRoleId) {
    try {
      await api.changeMemberRole(teamId, userId, { roleId: Number(nextRoleId) });
      toast({ type: 'success', message: 'Role updated' });

      const res = await api.getTeamMembers(teamId);
      setMembers(res?.data || res || []);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Update failed' });
    }
  }

  async function handleCreateRole(e) {
    e.preventDefault();
    if (!roleName.trim()) return;


    setCreatingRole(true);
    try {
      await api.createRole(teamId, { name: roleName.trim() });
      toast({ type: 'success', message: 'Role created' });
      setRoleName('');

      const res = await api.getTeamRoles(teamId);
      const data = res?.data || res || [];
      setRoles(data);

      if (!inviteRoleId && data?.[0]?.id !== undefined) {
        setInviteRoleId(String(data[0].id));
      }
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Create role failed' });
    } finally {
      setCreatingRole(false);
    }
  }

  async function handleDeleteRole(roleName) {
    // Backend currently does NOT protect delete-role with PermissionAuth.
    // To make the UI work, we compute effective permissions from the current user's
    // membership role on this team.
    const required = 'role:delete';

    if (!roleName) {
      toast({ type: 'error', message: 'Role name missing' });
      return;
    }

    // IMPORTANT:
    // Do not attempt permission gating on the frontend for role deletion.
    // The backend is the source of truth for authorization.
    // This avoids broken gating due to `GET /api/v1/user/view` not returning id/email.

    if (!window.confirm(`Delete role "${roleName}"?`)) return;



    try {
      await api.deleteRole(teamId, roleName);
      toast({ type: 'success', message: 'Role deleted' });

      const res = await api.getTeamRoles(teamId);
      const data = res?.data || res || [];
      setRoles(data);

      // Update default role selection used for inviting
      if (data?.[0]?.id !== undefined && !inviteRoleId) {
        setInviteRoleId(String(data[0].id));
      }

      // Refresh members to reflect possible role changes
      const mres = await api.getTeamMembers(teamId);
      setMembers(mres?.data || mres || []);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Delete role failed' });
    }
  }





  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">{team?.name || 'Team'}</div>
          <div className="text-sm text-slate-600 mt-1">Workspace management</div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-2xl border shadow-soft text-sm transition ${
              activeTab === 'members'
                ? 'bg-purple-600 text-white border-purple-200'
                : 'bg-white/40 hover:bg-white/60 border-white/70 text-slate-800'
            }`}
          >
            Members
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-2xl border shadow-soft text-sm transition ${
              activeTab === 'roles'
                ? 'bg-purple-600 text-white border-purple-200'
                : 'bg-white/40 hover:bg-white/60 border-white/70 text-slate-800'
            }`}
          >
            Roles
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-2xl border shadow-soft text-sm transition ${
              activeTab === 'permissions'
                ? 'bg-purple-600 text-white border-purple-200'
                : 'bg-white/40 hover:bg-white/60 border-white/70 text-slate-800'
            }`}
          >
            Permissions
          </button>
        </div>
      </div>


      <Card className="p-5 bg-white/60 border border-white/70 shadow-soft rounded-3xl">
        {activeTab === 'members' ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">

            <div className="space-y-4">
              {rolesRawLoading || rolesLoading ? <div className="text-slate-600">Loading roles...</div> : null}
              <SectionTitle title="Members" subtitle="Assign roles & remove access" />

              {membersLoading ? (
                <div className="text-slate-600">Loading members...</div>
              ) : (
                <div className="space-y-3">
                  {(members || []).map((m) => (
                    <div
                      key={m.userId || m.id}
                      className="rounded-3xl bg-white/60 border border-white/70 shadow-soft px-4 py-3 bb3d-hover transition flex items-center gap-3 justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={`${m.firstName || ''} ${m.lastName || ''}`.trim() || m.emailId || 'U'}
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {m.firstName} {m.lastName}
                          </div>
                          <div className="text-xs text-slate-600 truncate">{m.emailId}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={String(m.roleId ?? '')}
                          onChange={(e) => handleChangeMemberRole(m.userId, e.target.value)}
                          className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-purple-100"
                        >
                          {(roles || []).map((r) => (
                            <option key={r.id} value={String(r.id)}>
                              {r.name}
                            </option>
                          ))}
                        </select>

                        <Button variant="danger" className="px-3" onClick={() => handleRemoveMember(m.userId)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {members?.length === 0 ? <div className="text-sm text-slate-600">No members found.</div> : null}
                </div>
              )}
            </div>

            <Card className="p-4 bg-white/55 border border-white/70 shadow-soft">
              <SectionTitle title="Invite member" subtitle="Add user by email" />

              <form onSubmit={handleInvite} className="space-y-3">
                <div>
                  <Label>Member email</Label>
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="john@gmail.com"
                    required
                  />
                </div>
                <div>
                  <Label>Assigned role</Label>
                  <select
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-purple-100"
                    required
                  >
                    <option value="" disabled>
                      {rolesLoading ? 'Loading roles...' : 'Select a role'}
                    </option>
                    {(roleIdOptions || []).map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={inviting || rolesLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-black border border-purple-200"
                >
                  {inviting ? 'Inviting...' : 'Invite Member'}
                </Button>

                <div className="text-xs text-slate-600">Invites will be sent based on the team’s role permissions.</div>
              </form>
            </Card>
          </div>
        ) : activeTab === 'roles' ? (
          <div className="space-y-4">
            <SectionTitle title="Roles" subtitle="Manage role presets for team members" />

            <Card className="p-4 bg-white/55 border border-white/70 shadow-soft">
              <SectionTitle title="Create role" subtitle="Role name will appear for team member assignment" />

              <form onSubmit={handleCreateRole} className="flex gap-3 flex-wrap items-end">
                <div className="flex-1 min-w-[240px]">
                  <Label>Role name</Label>
                  <Input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. editor"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={creatingRole}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-black border border-purple-200 shadow-3d"
                >
                  {creatingRole ? 'Creating...' : 'Create role'}
                </Button>
              </form>
            </Card>

            {rolesLoading ? (
              <div className="text-slate-600">Loading roles...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(roles || []).map((r) => {
                    const memberCount = members?.filter((m) => String(m.roleId) === String(r.id)).length ?? 0;
                    return (
                      <Card key={r.id} className="p-4 rounded-3xl">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold">{r.name}</div>
                            <div className="text-xs text-slate-600 mt-1">Members: {memberCount}</div>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-200 shadow-soft flex items-center justify-center font-semibold text-purple-700">
                            {r.name?.slice(0, 1)?.toUpperCase() || 'R'}
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-slate-700">
                          <div className="text-xs text-slate-600">View permissions</div>
                          <div className="font-medium">
                            {r.permissions ? String(r.permissions).replace(/\[|\]|\"/g, '') : '—'}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="danger"
                            className="w-full"
                            onClick={() => handleDeleteRole(r.name)}
                          >
                            Delete role
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {(roles || []).length === 0 ? (
                  <div className="text-sm text-slate-700">
                    <div className="font-semibold">No roles found.</div>
                    <div className="text-xs text-slate-600 mt-1">Create your first role using the form above.</div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <SectionTitle title="Permissions" subtitle="Assign permission actions to team roles" />
            <TeamPermissionsPage />
          </div>
        )}
      </Card>
    </div>
  );
}

