import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Button, Card, Input, Label, SectionTitle } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';

export default function ProfilePage() {
  const { toast } = useToast();

  // Helper to quickly show backend error payloads in dev.
  const showErrorToast = (err) => {
    const msg = err?.message || 'Request failed';
    const payload = err?.payload;
    toast({ type: 'error', message: payload?.message || payload?.data?.message || msg });
    if (payload?.data) console.error('Backend payload.data:', payload.data);
    else console.error('Error:', err);
  };

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const [changing2fa, setChanging2fa] = useState(false);

  // Backend may return different field names; support common variants.
  const is2FAOn = !!(
    profile?.isTwoFactorEnabled ??
    profile?.twoFactorEnabled ??
    profile?.is2FAEnabled ??
    profile?.twoFAEnabled
  );

  async function refreshProfile() {
    setLoading(true);
    try {
      const res = await api.getProfile();
      setProfile(res?.data || res);
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updatePassword(e) {
    e.preventDefault();
    setChangingPwd(true);
    try {
      await api.updatePassword({ oldPassword, newPassword });
      toast({ type: 'success', message: 'Password updated' });
      setOldPassword('');
      setNewPassword('');
      await refreshProfile();
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setChangingPwd(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Profile" subtitle="Account & security settings" />

      {/* Profile Card */}
      <Card className="p-5">
        {loading ? (
          <div className="text-slate-600">Loading...</div>
        ) : (
          <div className="space-y-2">
            <div>
              <span className="text-xs text-slate-600">Name</span>
              <div className="font-medium">
                {profile?.firstName} {profile?.lastName}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-600">Email</span>
              <div className="font-medium">{profile?.emailId}</div>
            </div>

            <div>
              <span className="text-xs text-slate-600">2FA Enabled</span>
              <div className="font-medium">{is2FAOn ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Change Password Card */}
      <Card className="p-5">
        <div className="text-sm font-semibold mb-3">Change password</div>
        <form onSubmit={updatePassword} className="space-y-3">
          <div>
            <Label>Old password</Label>
            <Input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>New password</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={changingPwd}>
            {changingPwd ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </Card>

      {/* 2FA Card */}
      <Card className="p-5">
        <div className="text-sm font-semibold mb-3">Two-Factor Authentication (2FA)</div>


        <div className="text-sm text-slate-600">
          {is2FAOn
            ? '2FA is enabled for your account.'
            : '2FA is disabled for your account.'}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            disabled={changing2fa}
            onClick={async () => {
              setChanging2fa(true);
              toast({ type: 'info', message: 'Enabling 2FA...' });

              try {
                await api.enable2FA();
                toast({ type: 'success', message: '2FA enabled' });
                await refreshProfile();
              } catch (err) {
                toast({ type: 'error', message: err.message || 'Failed to enable 2FA' });
              } finally {
                setChanging2fa(false);
              }
            }}
          >
            {changing2fa ? 'Working...' : 'Enable 2FA'}
          </Button>

          <Button
            type="button"
            variant="danger"
            disabled={changing2fa}
            onClick={async () => {
              setChanging2fa(true);
              toast({ type: 'info', message: 'Disabling 2FA...' });
              console.log('[Profile] Disable 2FA clicked');

              try {
                const result = await api.disable2FA();
                console.log('[Profile] disable2FA result:', result);
                toast({ type: 'success', message: '2FA disabled' });

                await refreshProfile();
              } catch (err) {
                console.error('[Profile] disable2FA error:', err);
                toast({ type: 'error', message: err.message || 'Failed to disable 2FA' });
              } finally {
                setChanging2fa(false);
              }
            }}
          >
            {changing2fa ? 'Working...' : 'Disable 2FA'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

