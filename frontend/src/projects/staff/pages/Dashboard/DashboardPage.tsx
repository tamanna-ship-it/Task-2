import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/utils/authContext';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Calendar, Users, UserPlus, UserCheck, UserX,
  Clock, CheckCircle, XCircle, RefreshCw, CreditCard, ArrowUp, ArrowDown,
  AlertTriangle, Activity, ShieldCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const statusColors: Record<string, string> = {
  'clocked-in': 'bg-emerald-500',
  'Active': 'bg-emerald-500',
  'clocked-out': 'bg-slate-400',
  'Inactive': 'bg-slate-400',
  'on-break': 'bg-amber-500',
  'On Leave': 'bg-amber-500',
};
const statusLabels: Record<string, string> = {
  'clocked-in': 'Clocked In',
  'Active': 'Clocked In',
  'clocked-out': 'Clocked Out',
  'Inactive': 'Clocked Out',
  'on-break': 'On Break',
  'On Leave': 'On Leave',
};

const defaultStaffList = [
  { id: 'EMP001', name: 'Alachandra', designation: 'Hair Stylist', role_type: 'Full-Time', status: 'clocked-in' },
  { id: 'EMP003', name: 'Ashwinia', designation: 'Nail Tech', role_type: 'Part-Time', status: 'clocked-in' },
  { id: 'EMP004', name: 'Doctor', designation: 'Senior Doctor', role_type: 'Full-Time', status: 'on-break' },
  { id: 'EMP005', name: 'Dr.Thanos', designation: 'Chief Doctor', role_type: 'Full-Time', status: 'clocked-in' },
  { id: 'EMP006', name: 'Lady', designation: 'Hair Stylist', role_type: 'Full-Time', status: 'clocked-in' },
  { id: 'EMP007', name: 'Revanth', designation: 'Hair Stylist', role_type: 'Full-Time', status: 'clocked-in' },
  { id: 'EMP008', name: 'Kruthika Reddy Bokka', designation: 'Hair Stylist', role_type: 'Full-Time', status: 'clocked-out' },
  { id: 'EMP009', name: 'Susmitha', designation: 'Senior Stylist', role_type: 'Full-Time', status: 'clocked-in' },
];

const defaultServiceFloor = [
  { id: 'EMP007', name: 'Revanth', designation: 'Hair Stylist', status: 'busy', service: 'Hair Cut & Styling', client: 'Ananya Iyer', startTime: '10:30 AM', duration: '1h 30m' },
  { id: 'EMP009', name: 'Susmitha', designation: 'Senior Stylist', status: 'busy', service: 'Facial & Skincare', client: 'Sneha Reddy', startTime: '11:00 AM', duration: '45m' },
  { id: 'EMP005', name: 'Dr.Thanos', designation: 'Chief Doctor', status: 'busy', service: 'Laser Therapy', client: 'Vikram Singh', startTime: '09:00 AM', duration: '2h 00m' },
  { id: 'EMP006', name: 'Lady', designation: 'Hair Stylist', status: 'free', service: null, client: null, startTime: null, duration: null },
  { id: 'EMP001', name: 'Alachandra', designation: 'Hair Stylist', status: 'free', service: null, client: null, startTime: null, duration: null },
  { id: 'EMP003', name: 'Ashwinia', designation: 'Nail Tech', status: 'free', service: null, client: null, startTime: null, duration: null },
];

const defaultCollections = [
  { day: 'Mon', amount: 620000 },
  { day: 'Tue', amount: 750000 },
  { day: 'Wed', amount: 680000 },
  { day: 'Thu', amount: 440000 },
  { day: 'Fri', amount: 790000 },
  { day: 'Sat', amount: 850000 },
  { day: 'Sun', amount: 510000 },
];

const defaultRevBreakdown = [
  { label: 'Services', value: 3500000, percentage: 75, color: '#6366f1' },
  { label: 'Retail', value: 820000, percentage: 18, color: '#f59e0b' },
  { label: 'Memberships', value: 320000, percentage: 7, color: '#10b981' },
];

const defaultActivityLogs = [
  { action: 'Appointment Created', description: 'New appointment for Ananya Iyer - Hair Coloring & Styling', module: 'Appointments', user_name: 'Priya Sharma', created_at: '10 mins ago' },
  { action: 'Staff Clocked In', description: 'Revanth clocked in at 10:00 AM', module: 'Attendance', user_name: 'Revanth', created_at: '25 mins ago' },
  { action: 'Payment Received', description: 'Payment of ₹8,500 received from Ritu Agarwal', module: 'Payments', user_name: 'Sneha Reddy', created_at: '1 hour ago' },
  { action: 'New Client Registered', description: 'Kavita Joshi registered as new client', module: 'Clients', user_name: 'System', created_at: '2 hours ago' },
  { action: 'Daily Report Generated', description: 'Daily sales overview report generated', module: 'Reports', user_name: 'Owner', created_at: '3 hours ago' },
];

const KpiCard = ({ label, value, change, up, icon, color }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
        {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{change}
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <h3 className="text-xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

const PerfBar = ({ label, value, pct, color, textColor }: any) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${textColor}`}>{value}</span>
    </div>
    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
    </div>
  </div>
);

export const StaffDashboardPage: React.FC = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('Today');
  const [filter, setFilter] = useState('Aggregate');

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/staff/dashboard?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) { logout(); navigate('/login', { replace: true }); return; }
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const result = await res.json();
      setData(result);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [token, period, logout, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Loading Staff Dashboard...</p>
      </div>
    </div>
  );

  const m = data?.metrics || {};
  const staff = (data?.staff && data.staff.length > 0) ? data.staff : defaultStaffList;
  const sf = (data?.serviceFloor && data.serviceFloor.length > 0) ? data.serviceFloor : defaultServiceFloor;
  const rev = (data?.revenueBreakdown && data.revenueBreakdown.length > 0) ? data.revenueBreakdown : defaultRevBreakdown;
  const dc = (data?.dailyCollections && data.dailyCollections.length > 0) ? data.dailyCollections : defaultCollections;
  const logs = (data?.activityLog && data.activityLog.length > 0) ? data.activityLog : defaultActivityLogs;

  const colData = dc.map((d: any) => {
    let val = d.amount;
    if (filter === 'Services') val = d.services || Math.round(d.amount * 0.7);
    else if (filter === 'Products') val = d.retail || Math.round(d.amount * 0.2);
    else if (filter === 'By Client') val = Math.round(d.amount * 0.6);
    else if (filter === 'By Staff') val = Math.round(d.amount * 0.8);
    return { day: d.day || d.day_name, amount: val };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Staff Portal View
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in as {user?.email}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">Staff Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time operational metrics and salon performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-medium outline-none focus:border-teal-500 cursor-pointer">
            <option>Today</option><option>This Week</option><option>This Month</option>
          </select>
          <button onClick={fetchData} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 cursor-pointer shadow-xs transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"><AlertTriangle className="w-5 h-5 flex-shrink-0" />{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Total Revenue" value={m.totalRevenue || '₹46,40,000'} change="+18.4%" up icon={<DollarSign />} color="bg-indigo-50 text-indigo-600" />
        <KpiCard label="Bookings" value={String(m.totalBookings || 32)} change="+12.3%" up icon={<Calendar />} color="bg-purple-50 text-purple-600" />
        <KpiCard label="Clients" value={String(m.totalClients || 892)} change="+8.7%" up icon={<Users />} color="bg-cyan-50 text-cyan-600" />
        <KpiCard label="New Clients" value={String(m.newClients || 124)} change="+22.5%" up icon={<UserPlus />} color="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Returning" value={String(m.returningClients || 768)} change="+6.2%" up icon={<UserCheck />} color="bg-teal-50 text-teal-600" />
        <KpiCard label="Membership Rev" value={m.membershipRevenue || '₹3,20,000'} change="+15.1%" up icon={<CreditCard />} color="bg-amber-50 text-amber-600" />
        <KpiCard label="Completed" value={String(m.completed || 28)} change={m.completionRate || '87.5%'} up icon={<CheckCircle />} color="bg-green-50 text-green-600" />
        <KpiCard label="Cancelled" value={String(m.cancelled || 3)} change={`${m.cancelled || 3}%`} down={false} icon={<XCircle />} color="bg-rose-50 text-rose-600" />
        <KpiCard label="No-Show" value={m.noShow || '3.1%'} change="-2.1%" down={false} icon={<UserX />} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Today Employee Status & Live Service Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Today Employee Status</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Clock In</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Break</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>Out</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
            {staff.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {s.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 truncate">{s.designation}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-500 truncate">{s.role_type}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    (s.status === 'clocked-in' || s.status === 'Active') ? 'bg-emerald-50 text-emerald-700' :
                    (s.status === 'on-break' || s.status === 'On Leave') ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors[s.status] || 'bg-emerald-500'}`}></span>
                    {statusLabels[s.status] || s.status || 'Clocked In'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Live Service Floor</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>LIVE
            </span>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {sf.map((x: any) => (
              <div key={x.id} className={`p-3 rounded-xl border ${x.status === 'busy' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {x.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{x.name}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${x.status === 'busy' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${x.status === 'busy' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                    {x.status === 'busy' ? 'Busy' : 'Free'}
                  </span>
                </div>
                {x.status === 'busy' && x.service && (
                  <div className="ml-10 text-xs text-slate-600">
                    <p><span className="font-medium">Service:</span> {x.service}</p>
                    <p><span className="font-medium">Client:</span> {x.client}</p>
                    {x.startTime && <p><span className="font-medium">Since:</span> {x.startTime} ({x.duration})</p>}
                  </div>
                )}
                {x.status !== 'busy' && <p className="ml-10 text-xs text-slate-400 italic">Available</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown & New vs Returning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Revenue Breakdown</h2>
          <div style={{ width: '100%', height: 260, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rev} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}
                  label={({ label, percentage }: any) => `${label} ${percentage}%`}>
                  {rev.map((_: any, idx: number) => <Cell key={idx} fill={['#6366f1', '#f59e0b', '#10b981'][idx % 3]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">New vs Returning</h2>
          <div style={{ width: '100%', height: 260, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ name: 'New', value: m.newClients || 124 }, { name: 'Returning', value: m.returningClients || 768 }]}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill="#6366f1" /><Cell fill="#10b981" />
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Collections */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daily Collections</h2>
            <p className="text-xs text-slate-500 mt-0.5">Revenue collected - {period}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['Aggregate', 'By Client', 'By Staff', 'Products', 'Services'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${filter === f ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: 260, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={colData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: any) => `₹${(Number(v)/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
              <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <PerfBar label="Completion Rate" value={m.completionRate || '87.5%'}
              pct={m.completionRate ? parseFloat(m.completionRate) : 87.5}
              color="bg-emerald-500" textColor="text-emerald-600" />
            <PerfBar label="Cancellation Rate" value={`${m.cancelled || 3}%`}
              pct={3.5}
              color="bg-rose-500" textColor="text-rose-600" />
            <PerfBar label="No-Show Rate" value={m.noShow || '3.1%'}
              pct={3.1} color="bg-amber-500" textColor="text-amber-600" />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" /> Recent Activity
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {logs.map((log: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{log.module}</span><span>•</span><span>{log.user_name}</span><span>•</span><span>{log.created_at}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
