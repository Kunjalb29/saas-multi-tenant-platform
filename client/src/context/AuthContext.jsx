import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.getMe();
        setUser(data.data.user);
        setTenant(data.data.user.tenantId || null);
        setIsAuthenticated(true);
      } catch {
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { accessToken, refreshToken, user: userData, tenant: tenantData } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setUser(userData);
    setTenant(tenantData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    const { accessToken, refreshToken, user: userData, tenant: tenantData } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setUser(userData);
    setTenant(tenantData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors during logout
    } finally {
      localStorage.clear();
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        isSuperAdmin: user?.role === 'super_admin',
        isTenantAdmin: user?.role === 'tenant_admin' || user?.role === 'super_admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
