import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarDays, PlaneTakeoff, TrendingUp } from 'lucide-react';

export type StaffTabType = 'directory' | 'attendance' | 'leave' | 'performance';

interface Props {
  activeTab: StaffTabType;
  onTabChange?: (tab: StaffTabType) => void;
}

export const StaffHeaderTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs: { id: StaffTabType; label: string; icon: React.ReactNode; path: string }[] = [
    { id: 'directory', label: 'Staff Directory', icon: <Users className="w-4 h-4" />, path: '/owner/staff/directory' },
    { id: 'attendance', label: 'Attendance', icon: <CalendarDays className="w-4 h-4" />, path: '/owner/staff/attendance' },
    { id: 'leave', label: 'Leave Requests', icon: <PlaneTakeoff className="w-4 h-4" />, path: '/owner/staff/leave-requests' },
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" />, path: '/owner/staff/performance' },
  ];

  const handleSelect = (t: { id: StaffTabType; path: string }) => {
    if (onTabChange) onTabChange(t.id);
    navigate(t.path);
  };

  return (
    <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-wrap items-center gap-1 border border-slate-200/60 shadow-inner mb-6">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
