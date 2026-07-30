export type UserRole = 'owner' | 'manager' | 'staff';

export interface User {
  id: number | string;
  email: string;
  role: UserRole;
  name?: string;
  title?: string;
  department?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}
