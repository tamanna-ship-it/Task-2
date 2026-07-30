import { useAuth } from '@/utils/authContext';

export const useApi = () => {
  const { token, logout } = useAuth();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      // Auto logout if unauthenticated or forbidden
      // logout();
    }

    return response.json();
  };

  return {
    get: (endpoint: string) => fetchWithAuth(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) =>
      fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  };
};
