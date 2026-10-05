import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('sp_token'));

  useEffect(() => {
    if (!localStorage.getItem('sp_token')) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('sp_token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const { data } = await api.post(path, body);
    localStorage.setItem('sp_token', data.token);
    setUser(data.user);
  }, []);

  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (name, email, password) => authenticate('/auth/register', { name, email, password });
  const logout = () => {
    localStorage.removeItem('sp_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
