import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar/Sidebar';
import { Navbar } from './Navbar';
import { Breadcrumb } from './Breadcrumb';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Persistent Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-[260px] min-w-0">
        <Navbar />
        <Breadcrumb />
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
