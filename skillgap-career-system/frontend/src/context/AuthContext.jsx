import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Session state comes from the server on every load (GET /api/auth/me),
 * which is what makes a refresh or a browser restart keep the user signed in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('restoring'); // restoring | ready | error

  const restore = useCallback(async () => {
    setStatus('restoring');
    try {
      const { data } = await api.me();
      setUser(data.user);
      setStatus('ready');
    } catch (_err) {
      setUser(null);
      setStatus('ready');
    }
  }, []);

  useEffect(() => {
    restore();
  }, [restore]);

  const login = useCallback(async (credentials) => {
    const { data } = await api.login(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (values) => {
    const { data } = await api.register(values);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    setUser,
    isAuthenticated: Boolean(user),
    isRestoring: status === 'restoring',
    login,
    register,
    logout,
    refresh: restore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
