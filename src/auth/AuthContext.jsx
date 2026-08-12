import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext({
  user: null,
  loading: false,
  error: null,
  refreshUser: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProfile();
      setUser(res?.data || res);
      return;
    } catch (e) {
      // 401 happens when cookies are missing/expired. In this case, user stays unauthenticated.
      // Try refresh, but backend may be using JWT_SECRET for refresh too; if refresh fails, keep as unauthenticated.
      try {
        await api.refresh();
        const res2 = await api.getProfile();
        setUser(res2?.data || res2);
        return;
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(() => ({ user, loading, error, refreshUser, setUser }), [user, loading, error, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

