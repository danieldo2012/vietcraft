import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User, UserRole } from '@vietcraft/shared';
import { adminApi } from '../services/adminApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vc_admin_user') || localStorage.getItem('fl_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('vc_admin_token') || localStorage.getItem('fl_admin_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('vc_admin_token') || localStorage.getItem('fl_admin_token');
      if (storedToken) {
        try {
          const profile = await adminApi.getMe();
          setUser(profile);
          localStorage.setItem('vc_admin_user', JSON.stringify(profile));
        } catch {
          // Stored token is invalid or expired
          localStorage.removeItem('vc_admin_token');
          localStorage.removeItem('vc_admin_user');
          localStorage.removeItem('fl_admin_token');
          localStorage.removeItem('fl_admin_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await adminApi.login(credentials);
    setUser(res.user as any);
    setToken(res.token);
    localStorage.setItem('vc_admin_token', res.token);
    localStorage.setItem('vc_admin_user', JSON.stringify(res.user));
  };

  const logout = async () => {
    await adminApi.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('fl_admin_token');
    localStorage.removeItem('fl_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-600">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-700 space-y-4">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-sm">You do not have sufficient permissions to access this administrative section.</p>
        <a href="/admin" className="px-4 py-2 bg-lotus-forest text-white rounded-lg text-sm">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
