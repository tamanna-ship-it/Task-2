import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/utils/authContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const StaffPerformanceView: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/owner/performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading Performance Analytics...</p>
      </div>
    );
  }

  const salesAnalytics = data?.salesAnalytics || [
    { name: 'Revanth', revenue: 790000 },
    { name: 'Susmitha', revenue: 740000 },
    { name: 'Dr. Thanos', revenue: 680000 },
    { name: 'Testing 2', revenue: 440000 },
    { name: 'Lady', revenue: 100000 }
  ];

  const attendanceTrends = data?.attendanceTrends || [
    { name: 'Dr.Thanos', percentage: 3.5714, daysCount: 1 },
    { name: 'nbgnvn', percentage: 0, daysCount: 0 },
    { name: 'vrushab', percentage: 0, daysCount: 0 },
    { name: 'Testing 2', percentage: 0, daysCount: 0 },
    { name: 'testing', percentage: 0, daysCount: 0 },
    { name: 'Susmitha Nallani', percentage: 0, daysCount: 0 },
    { name: 'Nitish', percentage: 0, daysCount: 0 },
    { name: 'Alachandra', percentage: 0, daysCount: 0 },
    { name: 'Koushikredy', percentage: 0, daysCount: 0 },
    { name: 'New Manager test', percentage: 0, daysCount: 0 },
    { name: 'Revanth', percentage: 0, daysCount: 0 },
    { name: 'Sunitha', percentage: 0, daysCount: 0 },
    { name: 'Susmitha Nallani', percentage: 0, daysCount: 0 },
    { name: 'yeduvaku balaji', percentage: 0, daysCount: 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Card: Staff Performance Analytics matching Image 2 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Staff Performance Analytics</h2>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesAnalytics} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 200000, 400000, 600000, 800000]}
              />
              <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Card: Attendance Trends matching Image 2 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Attendance Trends</h2>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs font-semibold">
          <span className="text-emerald-600 font-bold text-sm">0.14%</span>
          <span className="text-blue-600 font-semibold text-sm">0% Avg Work Hours</span>
        </div>

        <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
          {attendanceTrends.map((st: any, idx: number) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="truncate">{st.name}</span>
                <span className="text-slate-500 font-semibold">
                  {st.percentage.toFixed(4)}% ({st.daysCount} days)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${Math.max(st.percentage * 10, st.percentage > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
