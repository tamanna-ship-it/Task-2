import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/utils/authContext';
import { Calendar, Grid3X3, Search, Plus, ChevronDown, Clock, DollarSign, Users, CalendarDays, ChevronLeft, ChevronRight, X, Phone, RefreshCw, Check } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AppointmentsPage: React.FC = () => {
  const { token } = useAuth();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('All Time');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [staffFilter, setStaffFilter] = useState('All Staff');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientName: '', clientPhone: '', clientEmail: '', service: '', staffName: '', staffId: '', date: new Date().toISOString().split('T')[0], time: '10:00 AM', duration: '45m', amount: '', type: 'Online Booking', appointmentType: 'pre-booking', clientDob: '', clientGender: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showPeriod, setShowPeriod] = useState(false);

  const fetchStaffList = useCallback(async () => {
    try {
      const res = await fetch(`${API}/owner/staff`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setStaffList(d.staff || []);
      }
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (statusFilter !== 'All Status') params.set('status', statusFilter);
      if (typeFilter !== 'All Types') params.set('type', typeFilter);
      if (staffFilter !== 'All Staff') params.set('staff', staffFilter);
      const res = await fetch(`${API}/owner/appointments?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const d = await res.json();
      setAppointments(d.appointments || []);
    } catch (err: any) { console.error(err); }
    finally { setLoading(false); }
  }, [token, period, statusFilter, typeFilter, staffFilter]);

  useEffect(() => { fetchAppointments(); fetchStaffList(); }, [fetchAppointments, fetchStaffList]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.date) { alert('Client name and date are required'); return; }
    setSubmitting(true);
    try {
      const body = { 
        clientName: form.clientName, 
        clientPhone: form.clientPhone, 
        clientEmail: form.clientEmail,
        clientDob: form.clientDob,
        clientGender: form.clientGender,
        service: form.service || 'General Hair & Beauty Service', 
        staffName: form.staffName || (staffList[0]?.name || 'Unassigned'), 
        staffId: form.staffId || staffList[0]?.id || '',
        date: form.date, 
        time: form.time || '10:00 AM', 
        duration: form.duration || '45m', 
        amount: Number(form.amount) || 500, 
        type: form.type, 
        appointmentType: form.appointmentType 
      };
      const res = await fetch(`${API}/owner/appointments`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to create appointment');
      
      setSuccessMsg(`Appointment ${result.appointment?.id || ''} created successfully for ${form.clientName}!`);
      setShowForm(false);
      setForm({ clientName: '', clientPhone: '', clientEmail: '', service: '', staffName: '', staffId: '', date: new Date().toISOString().split('T')[0], time: '10:00 AM', duration: '45m', amount: '', type: 'Online Booking', appointmentType: 'pre-booking', clientDob: '', clientGender: '' });
      setPeriod('All Time');
      setStatusFilter('All Status');
      fetchAppointments();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const filtered = appointments.filter(a => {
    const q = search.toLowerCase();
    return a.client_name?.toLowerCase().includes(q) || a.id?.toLowerCase().includes(q) || a.service?.toLowerCase().includes(q);
  });

  const totalRev = filtered.reduce((s, a) => s + (a.amount || 0), 0);
  const uniqueClients = new Set(filtered.map(a => a.client_name)).size;
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
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3 shadow-sm animate-pulse">
          <Check className="w-5 h-5" /><span>{successMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track all salon appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button onClick={() => setView('list')} className={`p-2 rounded-lg cursor-pointer ${view === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView('calendar')} className={`p-2 rounded-lg cursor-pointer ${view === 'calendar' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}><Calendar className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer">
            <Plus className="w-4 h-4" /> New Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric icon={<CalendarDays />} color="bg-indigo-50 text-indigo-600" label="Total Appointments" value={filtered.length} />
        <Metric icon={<DollarSign />} color="bg-emerald-50 text-emerald-600" label="Total Revenue" value={`₹${totalRev.toLocaleString('en-IN')}`} />
        <Metric icon={<Users />} color="bg-purple-50 text-purple-600" label="Unique Clients" value={uniqueClients} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search appointments..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
          </div>
          <FilterBtn label={period} open={showPeriod} onClick={() => { setShowPeriod(!showPeriod); setShowStatus(false); setShowType(false); setShowStaff(false); }}>
            {showPeriod && <DropItems items={['All Time', 'Today', 'Yesterday', 'This Week', 'This Month']} selected={period} onSelect={(v: string) => { setPeriod(v); setShowPeriod(false); }} />}
          </FilterBtn>
          <FilterBtn label={statusFilter} open={showStatus} onClick={() => { setShowStatus(!showStatus); setShowPeriod(false); setShowType(false); setShowStaff(false); }}>
            {showStatus && <DropItems items={['All Status', 'Ongoing', 'Completed', 'Upcoming', 'Cancelled']} selected={statusFilter} onSelect={(v: string) => { setStatusFilter(v); setShowStatus(false); }} />}
          </FilterBtn>
          <FilterBtn label={typeFilter} open={showType} onClick={() => { setShowType(!showType); setShowPeriod(false); setShowStatus(false); setShowStaff(false); }}>
            {showType && <DropItems items={['All Types', 'Walk-in', 'Home Visit', 'Online Booking']} selected={typeFilter} onSelect={(v: string) => { setTypeFilter(v); setShowType(false); }} />}
          </FilterBtn>
          <FilterBtn label={staffFilter} open={showStaff} onClick={() => { setShowStaff(!showStaff); setShowPeriod(false); setShowStatus(false); setShowType(false); }}>
            {showStaff && <DropItems items={['All Staff', ...staffNames]} selected={staffFilter} onSelect={(v: string) => { setStaffFilter(v); setShowStaff(false); }} />}
          </FilterBtn>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16"><RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" /></div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((a: any) => (
                <div key={a.id} className="p-4 hover:bg-slate-50/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {a.client_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900">{a.client_name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[a.status] || ''}`}>{a.status}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[a.type] || ''}`}>{a.type}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{a.service} {a.date && <span className="text-slate-400">({a.date})</span>}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{a.time} ({a.duration})</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{a.staff_name}</span>
                          {a.client_phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{a.client_phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">₹{(a.amount || 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Appointments Yet!</h3>
              <p className="text-sm text-slate-500 mb-6">There are no appointments matching your current filters. Try changing the time period.</p>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer"><Plus className="w-4 h-4" /> Create New Appointment</button>
            </div>
          )}
        </div>
      ) : (
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
                      <span className={`text-sm font-medium ${day === new Date().getDate() ? 'bg-indigo-600 text-white w-7 h-7 rounded-full inline-flex items-center justify-center' : 'text-slate-700'}`}>{day}</span>
                      {todayApts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {todayApts.slice(0, 3).map((a: any) => (
                            <div key={a.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium truncate">{a.time} - {a.service?.substring(0, 12)}</div>
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

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-lg font-bold text-slate-900">Create Appointment</h2><p className="text-xs text-slate-500 mt-0.5">Schedule new service sessions for your clients efficiently.</p></div>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Appointment Type</label>
                <div className="flex gap-2">
                  {['walkin-immediate', 'pre-booking', 'home-visit'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, appointmentType: t })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${form.appointmentType === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {t === 'walkin-immediate' ? 'Walk-in Immediate' : t === 'pre-booking' ? 'Pre-booking' : 'Home Visit'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Client Information</label>
                <div className="space-y-3">
                  <input placeholder="Full Name *" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 bg-slate-100 text-sm rounded-xl border border-slate-200 text-slate-500 font-medium">+91</span>
                    <input placeholder="Mobile Number" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                  </div>
                  <input placeholder="Email ID" type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                  <div className="flex gap-3">
                    <input placeholder="Date of Birth" type="date" value={form.clientDob} onChange={e => setForm({ ...form, clientDob: e.target.value })} className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                    <select value={form.clientGender} onChange={e => setForm({ ...form, clientGender: e.target.value })} className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none"><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Service *" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} required className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                <select value={form.staffName} onChange={e => {
                  const selected = staffList.find(s => s.name === e.target.value);
                  setForm({ ...form, staffName: e.target.value, staffId: selected?.id || '' });
                }} className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500">
                  <option value="">Select Staff</option>
                  {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.designation || 'Staff'})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Date *" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                <input placeholder="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Duration (e.g., 45m)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                <input placeholder="Amount (₹)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none"><option>Online Booking</option><option>Walk-in</option><option>Home Visit</option></select>
              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl cursor-pointer">
                {submitting ? 'Creating...' : 'Create Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Metric = ({ icon, color, label, value }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
    <div><p className="text-xs font-semibold text-slate-500 uppercase">{label}</p><h3 className="text-xl font-bold text-slate-900">{value}</h3></div>
  </div>
);

const FilterBtn = ({ label, children, onClick }: any) => (
  <div className="relative">
    <button onClick={onClick} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 cursor-pointer"><ChevronDown className="w-4 h-4 text-slate-400" />{label}</button>
    {children}
  </div>
);

const DropItems = ({ items, selected, onSelect }: any) => (
  <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[160px] py-1">
    {items.map((item: string) => (
      <button key={item} onClick={() => onSelect(item)} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer ${selected === item ? 'text-indigo-600 font-semibold' : 'text-slate-700'}`}>{item}</button>
    ))}
  </div>
);