// With Vite dev proxy, we can call the backend as relative `/api/...` paths.
// Keeping this default as empty prevents accidental cross-origin requests.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(method, path, { body, headers, signal } = {}) {
  // Always use the dev proxy. Backend CORS is handled server-side.
  // (So we call relative `/api/...` paths, not `http://localhost:3000/...`.)

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    // Needed because backend sets HTTP-only cookies; ensure browser accepts them.
    // (Especially when using http/https mixed modes.)
    mode: 'cors',
    signal
  });

  let payload = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await res.json();
  } else {
    const txt = await res.text();
    payload = txt ? { message: txt } : null;
  }

  if (!res.ok) {
    const message = payload?.message || payload?.data?.message || `Request failed (${res.status})`;
    const status = payload?.status || res.status;
    throw Object.assign(new Error(message), { status, payload });
  }

  return payload;
}

export const api = {
  signup: (data) => request('POST', '/api/v1/signup', { body: data }),
  login: (data) => request('POST', '/api/v1/login', { body: data }),
  verifyOtp: (data) => request('POST', '/api/v1/auth/verify-otp', { body: data }),
  resendOtp: () => request('POST', '/api/v1/auth/resend-otp'),
  refresh: () => request('POST', '/api/v1/auth/refresh'),
  logout: () => request('POST', '/api/v1/logout'),
  cleanupOtps: () => request('DELETE', '/api/v1/auth/cleanup-otps'),

  getProfile: () => request('GET', '/api/v1/user/view'),
  updatePassword: (data) => request('PATCH', '/api/v1/user/password', { body: data }),
  enable2FA: () => request('PATCH', '/api/v1/user/2fa/enable'),
  disable2FA: () => request('PATCH', '/api/v1/user/2fa/disable'),

  getAuditLogsAccount: (limit) => request('GET', `/api/v1/user/audit-logs/account${limit ? `?limit=${limit}` : ''}`),
  getAuditLogsNotes: (limit) => request('GET', `/api/v1/user/audit-logs/notes${limit ? `?limit=${limit}` : ''}`),
  getAuditLogsShared: (limit) => request('GET', `/api/v1/user/audit-logs/shared${limit ? `?limit=${limit}` : ''}`),

  createNote: (data) => request('POST', '/api/v1/notes', { body: data }),
  getNotes: () => request('GET', '/api/v1/notes'),
  getNoteById: (id) => request('GET', `/api/v1/notes/${id}`),
  updateNote: (id, data) => request('PATCH', `/api/v1/notes/${id}`, { body: data }),
  deleteNote: (id) => request('DELETE', `/api/v1/notes/${id}`),

  getSharedNotes: () => request('GET', '/api/v1/notes/shared-with-me'),

  shareNote: (id, data) => request('POST', `/api/v1/notes/${id}/share`, { body: data }),
  getSharesForNote: (id) => request('GET', `/api/v1/notes/${id}/shares`),
  updateSharePermission: (token, data) => request('PATCH', `/api/v1/shared/${token}/permission`, { body: data }),
  revokeShare: (token) => request('DELETE', `/api/v1/shared/${token}/revoke`),

  createTeam: (data) => request('POST', '/api/v1/teams', { body: data }),
  getTeams: () => request('GET', '/api/v1/teams'),
  getTeamDetails: (teamId) => request('GET', `/api/v1/teams/${teamId}`),

  createRole: (teamId, data) => request('POST', `/api/v1/teams/${teamId}/roles`, { body: data }),
  getTeamRoles: (teamId) => request('GET', `/api/v1/teams/${teamId}/roles`),
  deleteRole: (teamId, roleName) => request('DELETE', `/api/v1/teams/${teamId}/roles/${encodeURIComponent(roleName)}`),
  addPermissionsToRole: (teamId, roleName, data) => request('POST', `/api/v1/teams/${teamId}/roles/${encodeURIComponent(roleName)}/permissions`, { body: data }),

  getAllPermissions: () => request('GET', '/api/v1/permissions'),

  inviteMember: (teamId, data) => request('POST', `/api/v1/teams/${teamId}/members/invite`, { body: data }),
  getTeamMembers: (teamId) => request('GET', `/api/v1/teams/${teamId}/members`),
  changeMemberRole: (teamId, userId, data) => request('PATCH', `/api/v1/teams/${teamId}/members/${userId}/role`, { body: data }),
  removeMember: (teamId, userId) => request('DELETE', `/api/v1/teams/${teamId}/members/${userId}`),

  getTeamAuditLogs: (teamId) => request('GET', `/api/v1/teams/${teamId}/audit-logs`)
};

