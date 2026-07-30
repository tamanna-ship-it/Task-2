import React, { useEffect, useState } from 'react';
import { useAuth } from '@/utils/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, AlertCircle, RefreshCw, CheckCircle2, Clock, XCircle, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

interface ManagerDashboardData {
  title: string;
  metrics: {
    todayAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalRevenue: string;
    activeStaffOnShift: number;
  };
  recentAppointments: Array<{
    id: string;
    client_name: string;
    client_phone?: string;
    service: string;
    staff_name: string;
    date: string;
    time: string;
    duration: string;
    amount: number;
    status: string;
    type: string;
  }>;
  statusCounts: {
    ongoing: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  message: string;
}

export const ManagerDashboardPage: React.FC = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/manager/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch manager dashboard data (Status: ${res.status})`);
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error fetching manager dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const statusColors: Record<string, string> = {
    'Ongoing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Upcoming': 'bg-amber-50 text-amber-700 border-amber-200',
    'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Manager Restricted Access
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in as {user?.email}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
            Manager Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time appointment schedule overview, daily metrics, and booking control center.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/manager/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Appointments</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Agenda</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : data?.metrics.todayAppointments ?? 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Bookings</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {loading ? '...' : data?.metrics.upcomingAppointments ?? 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Today</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {loading ? '...' : data?.metrics.completedAppointments ?? 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointment Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : data?.metrics.totalRevenue || '₹0'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Appointments & Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments List (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
              <p className="text-xs text-slate-500">Live booking activity managed by salon manager</p>
            </div>
            <Link
              to="/manager/appointments"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
              <p className="text-sm">Loading appointment list...</p>
            </div>
          ) : data?.recentAppointments && data.recentAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recentAppointments.map((apt) => (
                <div key={apt.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 rounded-xl px-2 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {apt.client_name?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{apt.client_name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[apt.status] || ''}`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{apt.service} • Assigned: {apt.staff_name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">₹{(apt.amount || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">{apt.time || '10:00 AM'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No appointments logged yet.</p>
            </div>
          )}
        </div>

        {/* Status Summary & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Status Overview</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 uppercase">Upcoming</span>
                </div>
                <span className="text-lg font-extrabold text-amber-700">{data?.statusCounts.upcoming ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 uppercase">Completed</span>
                </div>
                <span className="text-lg font-extrabold text-emerald-700">{data?.statusCounts.completed ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                <div className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-900 uppercase">Cancelled</span>
                </div>
                <span className="text-lg font-extrabold text-rose-700">{data?.statusCounts.cancelled ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-900 uppercase">Active Staff</span>
                </div>
                <span className="text-lg font-extrabold text-purple-700">{data?.metrics.activeStaffOnShift ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-3">
            <h3 className="text-base font-bold">Appointments Manager Center</h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              As a Manager, you have permission to view, schedule, edit, and cancel appointments for salon clients.
            </p>
            <Link
              to="/manager/appointments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl shadow transition mt-2 cursor-pointer"
            >
              <span>Go to Appointments Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
