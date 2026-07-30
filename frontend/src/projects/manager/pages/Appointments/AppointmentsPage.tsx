import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/utils/authContext';
import {
  Calendar, Grid3X3, Search, Plus, ChevronDown, Clock, DollarSign,
  Users, CalendarDays, ChevronLeft, ChevronRight, X, Phone, RefreshCw,
  Check, Edit3, Trash2, ShieldCheck, AlertCircle, CheckCircle2
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const ManagerAppointmentsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('All Time');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [staffFilter, setStaffFilter] = useState('All Staff');
  const [search, setSearch] = useState('');
  
  // Modals & Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', clientEmail: '', service: '', staffName: '', staffId: '',
    date: new Date().toISOString().split('T')[0], time: '10:00 AM', duration: '45m', amount: '',
    status: 'Upcoming', type: 'Online Booking', appointmentType: 'pre-booking', clientDob: '', clientGender: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown filter visibility
  const [showStatus, setShowStatus] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showPeriod, setShowPeriod] = useState(false);

  const fetchStaffList = useCallback(async () => {
    try {
      const res = await fetch(`${API}/manager/staff`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setStaffList(d.staff || []);
      }
    } catch (err) { console.error('Staff fetch error:', err); }
  }, [token]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams({ period });
      if (statusFilter !== 'All Status') params.set('status', statusFilter);
      if (typeFilter !== 'All Types') params.set('type', typeFilter);
      if (staffFilter !== 'All Staff') params.set('staff', staffFilter);
      if (search) params.set('search', search);

      const res = await fetch(`${API}/manager/appointments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch manager appointments.');
      const d = await res.json();
      setAppointments(d.appointments || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading appointments.');
    } finally {
      setLoading(false);
    }
  }, [token, period, statusFilter, typeFilter, staffFilter, search]);

  useEffect(() => {
    fetchAppointments();
    fetchStaffList();
  }, [fetchAppointments, fetchStaffList]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      clientName: '', clientPhone: '', clientEmail: '', service: '', staffName: staffList[0]?.name || '', staffId: staffList[0]?.id || '',
      date: new Date().toISOString().split('T')[0], time: '10:00 AM', duration: '45m', amount: '',
      status: 'Upcoming', type: 'Online Booking', appointmentType: 'pre-booking', clientDob: '', clientGender: ''
    });
    setShowForm(true);
  };

  const handleOpenEdit = (apt: any) => {
    setEditingId(apt.id);
    setForm({
      clientName: apt.client_name || '',
      clientPhone: apt.client_phone || '',
      clientEmail: apt.client_email || '',
      service: apt.service || '',
      staffName: apt.staff_name || '',
      staffId: apt.staff_id || '',
      date: apt.date || new Date().toISOString().split('T')[0],
      time: apt.time || '10:00 AM',
      duration: apt.duration || '45m',
      amount: String(apt.amount || ''),
      status: apt.status || 'Upcoming',
      type: apt.type || 'Online Booking',
      appointmentType: apt.appointment_type || 'pre-booking',
      clientDob: apt.client_dob || '',
      clientGender: apt.client_gender || ''
    });
    setShowForm(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.date) {
      alert('Client name and date are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const body = {
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        clientEmail: form.clientEmail,
        clientDob: form.clientDob,
        clientGender: form.clientGender,
        service: form.service || 'Hair & Beauty Service',
        staffName: form.staffName || (staffList[0]?.name || 'Unassigned'),
        staffId: form.staffId || staffList[0]?.id || '',
        date: form.date,
        time: form.time || '10:00 AM',
        duration: form.duration || '45m',
        amount: Number(form.amount) || 0,
        status: form.status,
        type: form.type,
        appointmentType: form.appointmentType
      };

      const url = editingId ? `${API}/manager/appointments/${editingId}` : `${API}/manager/appointments`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to save appointment');
      }

      setSuccessMsg(editingId ? `Appointment ${editingId} updated successfully!` : `New appointment ${result.appointment?.id || ''} created successfully!`);
      setShowForm(false);
      fetchAppointments();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id: string, clientName: string) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${id} for ${clientName}?`)) return;

    try {
      const res = await fetch(`${API}/manager/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to cancel appointment');

      setSuccessMsg(`Appointment ${id} has been cancelled.`);
      fetchAppointments();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API}/manager/appointments/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccessMsg(`Appointment ${id} status updated to ${newStatus}.`);
        fetchAppointments();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = appointments.filter(a => {
    const q = search.toLowerCase();
    return (
      a.client_name?.toLowerCase().includes(q) ||
      a.id?.toLowerCase().includes(q) ||
      a.service?.toLowerCase().includes(q) ||
      a.client_phone?.toLowerCase().includes(q)
    );
  });

  const totalRev = filtered.reduce((s, a) => s + (a.amount || 0), 0);
  const completedCount = filtered.filter(a => a.status === 'Completed').length;
  const upcomingCount = filtered.filter(a => a.status === 'Upcoming' || a.status === 'Ongoing').length;
  const cancelledCount = filtered.filter(a => a.status === 'Cancelled').length;

  const staffNames = [...new Set([...staffList.map(s => s.name), ...appointments.map(a => a.staff_name)].filter(Boolean))];

  const statusColors: Record<string, string> = {
    'Ongoing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Upcoming': 'bg-amber-50 text-amber-700 border-amber-200',
    'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const typeColors: Record<string, string> = {
    'Walk-in': 'bg-cyan-50 text-cyan-700',
    'Home Visit': 'bg-purple-50 text-purple-700',
    'Online Booking': 'bg-blue-50 text-blue-700'
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3 shadow-sm animate-pulse">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Manager Role Control
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in as {user?.email}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">Appointments Booking & Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Schedule, modify, and manage all salon client appointments</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg cursor-pointer transition ${view === 'list' ? 'bg-purple-50 text-purple-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-lg cursor-pointer transition ${view === 'calendar' ? 'bg-purple-50 text-purple-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              title="Calendar View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm cursor-pointer transition"
          >
            <Plus className="w-4 h-4" /> New Appointment
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={<CalendarDays />} color="bg-purple-50 text-purple-600" label="Total Appointments" value={filtered.length} />
        <Metric icon={<CheckCircle2 />} color="bg-emerald-50 text-emerald-600" label="Completed Bookings" value={completedCount} />
        <Metric icon={<Clock />} color="bg-amber-50 text-amber-600" label="Upcoming / Ongoing" value={upcomingCount} />
        <Metric icon={<DollarSign />} color="bg-indigo-50 text-indigo-600" label="Filtered Revenue" value={`₹${totalRev.toLocaleString('en-IN')}`} />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, ID, service, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <FilterBtn label={period} open={showPeriod} onClick={() => { setShowPeriod(!showPeriod); setShowStatus(false); setShowType(false); setShowStaff(false); }}>
            {showPeriod && <DropItems items={['All Time', 'Today', 'Yesterday', 'This Week', 'This Month']} selected={period} onSelect={(v: string) => { setPeriod(v); setShowPeriod(false); }} />}
          </FilterBtn>

          <FilterBtn label={statusFilter} open={showStatus} onClick={() => { setShowStatus(!showStatus); setShowPeriod(false); setShowType(false); setShowStaff(false); }}>
            {showStatus && <DropItems items={['All Status', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled']} selected={statusFilter} onSelect={(v: string) => { setStatusFilter(v); setShowStatus(false); }} />}
          </FilterBtn>

          <FilterBtn label={typeFilter} open={showType} onClick={() => { setShowType(!showType); setShowPeriod(false); setShowStatus(false); setShowStaff(false); }}>
            {showType && <DropItems items={['All Types', 'Walk-in', 'Home Visit', 'Online Booking']} selected={typeFilter} onSelect={(v: string) => { setTypeFilter(v); setShowType(false); }} />}
          </FilterBtn>

          <FilterBtn label={staffFilter} open={showStaff} onClick={() => { setShowStaff(!showStaff); setShowPeriod(false); setShowStatus(false); setShowType(false); }}>
            {showStaff && <DropItems items={['All Staff', ...staffNames]} selected={staffFilter} onSelect={(v: string) => { setStaffFilter(v); setShowStaff(false); }} />}
          </FilterBtn>
        </div>
      </div>

      {/* Main View Area */}
      {view === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Loading manager appointments...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((a: any) => (
                <div key={a.id} className="p-4 md:p-5 hover:bg-slate-50/60 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {a.client_name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900">{a.client_name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[a.status] || ''}`}>
                            {a.status}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[a.type] || ''}`}>
                            {a.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium mt-1">
                          {a.service} {a.date && <span className="text-slate-400 font-normal">({a.date})</span>}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-500" />{a.time} ({a.duration})</span>
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-500" />Assigned: {a.staff_name}</span>
                          {a.client_phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-500" />{a.client_phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className="text-base font-black text-slate-900">₹{(a.amount || 0).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{a.id}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'Completed')}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition cursor-pointer"
                            title="Mark as Completed"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Edit Appointment"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {a.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelAppointment(a.id, a.client_name)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                            title="Cancel Appointment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Appointments Found</h3>
              <p className="text-sm text-slate-500 mb-6">No records match your selected filters or search parameters.</p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Schedule Appointment
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
              <h2 className="text-lg font-bold text-slate-900">July 2026</h2>
              <button className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500 uppercase">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 3;
              const todayApts = appointments.filter((a: any) => new Date(a.date).getDate() === day);
              return (
                <div key={i} className={`bg-white p-3 min-h-[100px] ${day < 1 || day > 31 ? 'bg-slate-50/50' : ''}`}>
                  {day >= 1 && day <= 31 && (
                    <>
                      <span className={`text-sm font-medium ${day === new Date().getDate() ? 'bg-purple-600 text-white w-7 h-7 rounded-full inline-flex items-center justify-center font-bold' : 'text-slate-700'}`}>{day}</span>
                      {todayApts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {todayApts.slice(0, 3).map((a: any) => (
                            <div key={a.id} onClick={() => handleOpenEdit(a)} className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium truncate cursor-pointer">
                              {a.time} - {a.client_name}
                            </div>
                          ))}
                          {todayApts.length > 3 && <div className="text-xs text-slate-400 font-medium px-1">+{todayApts.length - 3} more</div>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Appointment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingId ? `Edit Appointment (${editingId})` : 'Create New Appointment'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manager Booking Control Center</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Booking Type</label>
                <div className="flex gap-2">
                  {['walkin-immediate', 'pre-booking', 'home-visit'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, appointmentType: t })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${form.appointmentType === t ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {t === 'walkin-immediate' ? 'Walk-in' : t === 'pre-booking' ? 'Pre-booking' : 'Home Visit'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block">Client Information</label>
                <input
                  placeholder="Client Full Name *"
                  value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  <span className="px-3 py-2.5 bg-slate-100 text-sm rounded-xl border border-slate-200 text-slate-500 font-medium">+91</span>
                  <input
                    placeholder="Mobile Phone Number"
                    value={form.clientPhone}
                    onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                    className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                  />
                </div>
                <input
                  placeholder="Client Email Address"
                  type="email"
                  value={form.clientEmail}
                  onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block">Service & Staff Assignment</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Service Required *"
                    value={form.service}
                    onChange={e => setForm({ ...form, service: e.target.value })}
                    required
                    className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                  />
                  <select
                    value={form.staffName}
                    onChange={e => {
                      const selected = staffList.find(s => s.name === e.target.value);
                      setForm({ ...form, staffName: e.target.value, staffId: selected?.id || '' });
                    }}
                    className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="">Select Staff Member</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.designation || 'Staff'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      required
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm({ ...form, time: e.target.value })}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Duration</label>
                    <input
                      placeholder="e.g. 45m or 1h 30m"
                      value={form.duration}
                      onChange={e => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Amount (₹)</label>
                    <input
                      placeholder="Amount"
                      type="number"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500 bg-white"
                    >
                      <option>Upcoming</option>
                      <option>Ongoing</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Channel</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-500 bg-white"
                    >
                      <option>Online Booking</option>
                      <option>Walk-in</option>
                      <option>Home Visit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold text-sm rounded-xl cursor-pointer shadow-sm transition"
                >
                  {submitting ? 'Saving Appointment...' : editingId ? 'Update Appointment' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Metric = ({ icon, color, label, value }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
      <h3 className="text-xl font-black text-slate-900 mt-0.5">{value}</h3>
    </div>
  </div>
);

const FilterBtn = ({ label, children, onClick }: any) => (
  <div className="relative">
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 cursor-pointer shadow-xs"
    >
      <ChevronDown className="w-4 h-4 text-slate-400" />
      <span>{label}</span>
    </button>
    {children}
  </div>
);

const DropItems = ({ items, selected, onSelect }: any) => (
  <div className="absolute top-full mt-1.5 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-[160px] py-1">
    {items.map((item: string) => (
      <button
        key={item}
        onClick={() => onSelect(item)}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 cursor-pointer transition ${selected === item ? 'text-purple-700 font-bold bg-purple-50/50' : 'text-slate-700'}`}
      >
        {item}
      </button>
    ))}
  </div>
);
