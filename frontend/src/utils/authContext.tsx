import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginResponse, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: UserRole) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'estetica_auth_token';
const USER_KEY = 'estetica_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate stored token on initial load with /api/auth/me
  useEffect(() => {
    const verifyExistingSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification network error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyExistingSession();
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<User> => {
    setError(null);
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const endpoint = role ? `${baseUrl}/auth/${role}/login` : `${baseUrl}/auth/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);

      return data.user;
    } catch (err: any) {
      setIsLoading(false);
      const message = err.message || 'Network error occurred while signing in.';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
