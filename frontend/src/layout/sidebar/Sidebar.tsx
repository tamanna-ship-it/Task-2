import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/utils/authContext';
import { useLayout } from '@/utils/LayoutContext';
import { ownerMenu } from './menu/ownerMenu';
import { managerMenu } from './menu/managerMenu';
import { staffMenu } from './menu/staffMenu';
import { LayoutDashboard, TrendingUp, Building2, Settings, Calendar, Package, Users, Shield, X } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import '../css/Sidebar.css';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Settings,
  Calendar,
  Package,
  Users,
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isSidebarOpen, closeSidebar } = useLayout();
  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';
  const menuItems = isOwner ? ownerMenu : isManager ? managerMenu : staffMenu;

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Close Button for Mobile */}
        <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close sidebar">
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header with Logo */}
        <div className="sidebar-header flex items-center justify-center py-4 px-3">
          <img src={logoImg} alt="esteticanow" className="h-8 object-contain" />
        </div>

        {/* Role Banner */}
        <div className="role-banner">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span className="capitalize">{user?.role} Mode</span>
        </div>

        {/* Nav Menu */}
        <nav className="sidebar-nav">
          <div className="menu-group-label">NAVIGATION</div>
          <ul className="menu-list">
            {menuItems.map((item) => {
              const Icon = iconMap[item.iconName] || LayoutDashboard;
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'nav-item-active' : ''}`
                    }
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-title">{item.title}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom User Card */}
        <div className="sidebar-footer">
          <div className="user-avatar font-bold text-white uppercase">
            {user?.email ? user.email.charAt(0) : 'U'}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.email}</p>
            <p className="user-email capitalize">Role: {user?.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
