import React from 'react';
import { Sparkles, Rocket, Clock, ShieldCheck, Zap, Layers, Activity } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface ComingSoonProps {
  role: UserRole;
  moduleName: string;
  description: string;
  upcomingFeatures: string[];
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  role,
  moduleName,
  description,
  upcomingFeatures
}) => {
  const isOwner = role === 'owner';

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      {/* Top Banner Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 shadow-xl text-white ${
        isOwner
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900'
          : 'bg-gradient-to-br from-cyan-900 via-teal-900 to-slate-900'
      }`}>
        {/* Background Decorative Rings */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            {/* Role Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/20 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{role.toUpperCase()} PORTAL</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
              {moduleName}
            </h1>
            <p className="text-base md:text-lg text-slate-200 font-normal leading-relaxed">
              {description}
            </p>

            {/* Launch Status Badge */}
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-300 bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-400/30">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Status: Module in active production rollout</span>
            </div>
          </div>

          {/* Big Visual Card */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
            <div className="relative group">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center p-4 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <Rocket className={`w-16 h-16 mb-2 ${isOwner ? 'text-indigo-300' : 'text-teal-300'} animate-bounce`} />
                <span className="text-2xl font-black tracking-wider text-white">COMING SOON</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {upcomingFeatures.map((feature, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              isOwner ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'
            }`}>
              {idx === 0 ? <Sparkles className="w-6 h-6" /> : idx === 1 ? <Zap className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Phase {idx + 1}: {feature}
            </h3>
            <p className="text-sm text-slate-500">
              Configured specifically for {role} privilege levels with real-time sync.
            </p>
          </div>
        ))}
      </div>

      {/* System info bar */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">
            Authentication state verified via JWT payload. Active role session: <strong className="capitalize text-slate-900">{role}</strong>
          </span>
        </div>
        <span className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
          v1.0.0-rc2
        </span>
      </div>
    </div>
  );
};
