import React, { useState } from 'react';
import { api } from '../api/client.js';
import { Button, Input, Label, SectionTitle } from '../components/ui.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.signup({ firstName, lastName, emailId, password });
      toast({ type: 'success', message: 'Account created. Please login.' });
      navigate('/login');
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Signup failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-3d flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SectionTitle title="Create account" subtitle="Start writing notes securely" />
        <div className="rounded-3xl bg-white/60 border border-white/70 shadow-soft p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input value={emailId} onChange={(e) => setEmailId(e.target.value)} type="email" required />
            </div>

            <div>
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Please wait...' : 'Sign up'}
            </Button>

            <div className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-700 hover:underline font-medium">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

