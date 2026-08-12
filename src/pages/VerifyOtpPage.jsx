import React, { useState } from 'react';
import { api } from '../api/client.js';
import { Button, Input, Label, SectionTitle } from '../components/ui.jsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.verifyOtp({ otp });
      toast({ type: 'success', message: 'OTP verified. Welcome!' });
      // If 2FA was correct backend should set auth cookies (token/refreshToken)
      // Navigate to main dashboard.
      navigate('/dashboard');
    } catch (err) {
      toast({ type: 'error', message: err.message || 'OTP verify failed' });
    } finally {
      setLoading(false);
    }
  }


  async function resend() {
    setResending(true);
    try {
      await api.resendOtp();
      toast({ type: 'success', message: 'OTP resent.' });
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Resend failed' });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-3d flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SectionTitle title="Verify OTP" subtitle="2FA authentication" />
        <div className="rounded-3xl bg-white/60 border border-white/70 shadow-soft p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>OTP</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" required />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Verify'}
            </Button>

            <Button type="button" onClick={resend} disabled={resending} className="w-full !bg-white/40">
              {resending ? 'Resending...' : 'Resend OTP'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

