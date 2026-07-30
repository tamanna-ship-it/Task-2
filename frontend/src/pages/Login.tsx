import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/utils/authContext';
import { Button, Input, Card } from '@/shared/components';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Shield, Building2, UserCheck } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { UserRole } from '@/types/auth';

export const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('owner@esteticanow.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isAuthenticated, user, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear any stale global auth errors on mount
  useEffect(() => {
    clearError();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard', { replace: true });
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Update default email when role tab changes
  const handleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    clearError();
    setValidationErrors({});
    
    const roleEmailMap: Record<UserRole, string> = {
      owner: 'owner@esteticanow.com',
      manager: 'manager@esteticanow.com',
      staff: 'staff@esteticanow.com'
    };
    setEmail(roleEmailMap[role]);
    setPassword('password123');
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      // Send credentials to role-specific backend endpoint: POST /api/auth/{selectedRole}/login
      const loggedInUser = await login(email.trim(), password, selectedRole);

      if (loggedInUser.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else if (loggedInUser.role === 'manager') {
        navigate('/manager/dashboard', { replace: true });
      } else if (loggedInUser.role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      }
    } catch (err) {
      // Error state is captured in AuthContext and displayed in error alert banner
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10">
        {/* Logo Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img
            src={logoImg}
            alt="esteticanow"
            className="h-12 md:h-14 object-contain mb-2 drop-shadow-lg"
          />
          <p className="text-slate-400 text-sm font-medium">Enterprise Role-Based Access Portal</p>
        </div>

        <Card variant="glass" className="backdrop-blur-xl bg-white/95 border border-white/40 shadow-2xl p-6 md:p-8 rounded-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Role-Based Account Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Select your role tab and enter credentials to log in</p>
          </div>

          {/* Role Login Tabs: Owner, Manager, Staff */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Select Login Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange('owner')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                  selectedRole === 'owner'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('manager')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                  selectedRole === 'manager'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('staff')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                  selectedRole === 'staff'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Staff</span>
              </button>
            </div>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Authentication Error</strong>
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Email Address`}
              type="email"
              placeholder={`Enter ${selectedRole} email`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              error={validationErrors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              error={validationErrors.password}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:text-slate-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className={`mt-2 text-white shadow-lg ${
                selectedRole === 'owner'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  : selectedRole === 'manager'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
              }`}
            >
              Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
