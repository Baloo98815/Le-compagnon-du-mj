import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  // loading = vérification initiale du jeton existant
  const [loading, setLoading] = useState(() => !!tokenStore.get());

  // Au montage, si un jeton existe, on valide la session auprès du backend.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authAPI.me()
      .then((u) => {
        setUser(u);
        tokenStore.setUser(u);
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, user: u } = await authAPI.login(username, password);
    tokenStore.set(token);
    tokenStore.setUser(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = { user, isAuthenticated: !!user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
