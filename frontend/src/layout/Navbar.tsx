import React from 'react';
import { useAuth } from '@/utils/authContext';
import { useLayout } from '@/utils/LayoutContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Search, Shield, User as UserIcon, Menu } from 'lucide-react';
import './css/Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useLayout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleClass =
    user?.role === 'owner'
      ? 'role-owner'
      : user?.role === 'manager'
      ? 'role-manager'
      : 'role-staff';

  return (
    <header className="top-navbar">
      {/* Left Section: Hamburger + Search */}
      <div className="navbar-left">
        {/* Hamburger Menu Button (visible on mobile) */}
        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="navbar-search">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search modules..."
            className="search-input"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-actions">
        {/* Role Badge (hidden on mobile) */}
        <div className={`role-badge-pill ${roleClass} hide-mobile`}>
          <Shield className="w-3.5 h-3.5" />
          <span>Role: <strong className="uppercase">{user?.role}</strong></span>
        </div>

        {/* Notifications Icon */}
        <button className="icon-btn" title="Notifications">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="notification-dot" />
        </button>

        {/* User Card & Logout Button */}
        <div className="user-profile-menu">
          <div className="profile-chip">
            <div className="avatar-circle">
              <UserIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div className="profile-details hide-mobile">
              <span className="profile-name">{user?.email}</span>
              <span className="profile-role capitalize">{user?.role} Account</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn" title="Logout of session">
            <LogOut className="w-4 h-4" />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
