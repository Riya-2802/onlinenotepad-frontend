import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';
import { ToastProvider, useToast } from './Toast.jsx';

function Shell() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    await refreshUser();
    toast({ type: 'success', message: 'Logged out' });
    navigate('/login');
  }

  const navItem = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/70 shadow-3d' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-3d text-slate-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/40 border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-white/70 shadow-3d flex items-center justify-center">🗒️</span>
            <div>
              <div className="font-semibold">Online Notepad</div>
              <div className="text-xs text-slate-600">3D light UI</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:block">
                <div className="text-xs text-slate-600">Signed in as</div>
                <div className="text-sm font-medium">{user.emailId}</div>
              </div>
            ) : null}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-white/70 shadow-3d hover:bg-white transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-white/55 border border-white/70 rounded-3xl shadow-soft p-3">
            <nav className="flex flex-col gap-1">
              
              {navItem('/notes', 'Notes')}
              {navItem('/shared', 'Shared')}
              {navItem('/teams', 'Teams')}
              {navItem('/profile', 'Profile')}

              {navItem('/audit', 'Audit')}
            </nav>
          </div>

          <div className="mt-4 p-4 bg-white/45 border border-white/60 rounded-3xl shadow-soft">
            <div className="text-xs text-slate-600">Tip</div>
            <div className="mt-1 text-sm font-medium">Use Notes to create, edit, and share with permissions.</div>
          </div>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}

