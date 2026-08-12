import React, { useState } from 'react';
import { api } from '../api/client.js';
import { Button, Input, Label, SectionTitle } from '../components/ui.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';

export default function LoginPage() {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login({ emailId, password });
      // If 2FA is enabled backend returns 200 with message about OTP sent (data is null).
      // If 2FA is NOT enabled backend returns 200 with user data.
      toast({ type: 'success', message: res?.message || 'Logged in' });

      if (res?.data) {
        navigate('/Notes');
      } else {
        // User must verify OTP. Route to OTP screen.
        navigate('/verify-otp');
      }

    } catch (err) {
      toast({ type: 'error', message: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-3d flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SectionTitle title="Login" subtitle="Cookie-based JWT auth" />
        <div className="rounded-3xl bg-white/60 border border-white/70 shadow-soft p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={emailId} onChange={(e) => setEmailId(e.target.value)} type="email" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Please wait...' : 'Login'}
            </Button>

            <div className="text-sm text-slate-600 flex items-center justify-between">
              <Link to="/signup" className="text-sky-700 hover:underline font-medium">
                Create account
              </Link>
              <Link to="/verify-otp" className="text-sky-700 hover:underline font-medium">
                Verify OTP
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

