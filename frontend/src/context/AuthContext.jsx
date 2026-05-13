import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Restore from localStorage on first load
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const { data } = await apiLogin(credentials);
    // data = { token, username, email }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
    setToken(data.token);
    setUser({ username: data.username, email: data.email });
    return data;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (credentials) => {
    const { data } = await apiRegister(credentials);
    // Backend returns 201 with AuthResponse — log them in immediately
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
    setToken(data.token);
    setUser({ username: data.username, email: data.email });
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
