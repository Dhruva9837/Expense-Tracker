import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (_) { }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const hasRole = (...roles) => roles.includes(user?.role);
  const isAdmin = () => user?.role === 'admin';
  const isViewer = () => user?.role === 'viewer';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, isAdmin, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
