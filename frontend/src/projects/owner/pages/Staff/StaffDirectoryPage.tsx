import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/utils/authContext';
import { Users, Search, Plus, Download, Upload, ChevronDown, Star, UserCheck, UserX, X, RefreshCw, Pencil } from 'lucide-react';
import { StaffHeaderTabs, StaffTabType } from './components/StaffHeaderTabs';
import { StaffAttendanceView } from './components/StaffAttendanceView';
import { StaffLeaveRequestsView } from './components/StaffLeaveRequestsView';
import { StaffPerformanceView } from './components/StaffPerformanceView';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Staff { id: string; name: string; email: string; phone: string; role_type: string; outlet: string; designation: string; status: string; rating: number; join_date: string; }

interface StaffDirectoryPageProps {
  tab?: StaffTabType;
}

export const StaffDirectoryPage: React.FC<StaffDirectoryPageProps> = ({ tab = 'directory' }) => {
  const { token } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [summary, setSummary] = useState({ totalStaff: 0, presentToday: 0, onLeave: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StaffTabType>(tab);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showStatus, setShowStatus] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [editModal, setEditModal] = useState<Staff | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', roleType: '', outlet: '', designation: '', status: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', roleType: 'Full-Time', outlet: '', designation: '' });

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const fetchStaff = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All Status') params.set('status', statusFilter);
      if (roleFilter !== 'All Roles') params.set('roleType', roleFilter);
      const res = await fetch(`${API}/owner/staff?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const d = await res.json();
      setStaff(d.staff);
      setSummary(d.summary);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [token, statusFilter, roleFilter]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openEdit = (s: Staff) => {
    setEditModal(s);
    setEditForm({ name: s.name, email: s.email, phone: s.phone || '', roleType: s.role_type, outlet: s.outlet, designation: s.designation, status: s.status });
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    try {
      const res = await fetch(`${API}/owner/staff/${editModal.id}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update');
      const d = await res.json();
      setStaff(prev => prev.map(s => s.id === editModal.id ? d.staff : s));
      setEditModal(null);
      fetchStaff();
    } catch (err: any) { alert(err.message); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/owner/staff`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      if (!res.ok) throw new Error('Failed');
      setShowCreate(false);
      setCreateForm({ name: '', email: '', phone: '', roleType: 'Full-Time', outlet: '', designation: '' });
      fetchStaff();
    } catch (err: any) { alert(err.message); }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API}/owner/staff`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      let csv = 'ID,Name,Email,Phone,Role Type,Outlet,Designation,Status,Rating\n';
      d.staff.forEach((s: Staff) => { csv += `${s.id},${s.name},${s.email},${s.phone},${s.role_type},${s.outlet},${s.designation},${s.status},${s.rating}\n`; });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'staff-directory.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) { alert(err.message); }
  };

  const handleImport = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0]; if (!file) return;
      const text = await file.text();
      for (const line of text.split('\n').slice(1).filter((l: string) => l.trim())) {
        const [id, name, email, phone, roleType, outlet, designation] = line.split(',');
        if (name && email) {
          await fetch(`${API}/owner/staff`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone?.trim(), roleType: roleType?.trim(), outlet: outlet?.trim(), designation: designation?.trim() })
          });
        }
      }
      fetchStaff();
    };
    input.click();
  };

  const filtered = staff.filter(s => { const q = search.toLowerCase(); return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q); });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { 'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200', 'On Leave': 'bg-amber-50 text-amber-700 border-amber-200', 'Inactive': 'bg-slate-100 text-slate-600 border-slate-200' };
    return `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-slate-100 text-slate-600'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your salon team, attendance, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleImport} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"><Upload className="w-4 h-4" /> Import</button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"><Download className="w-4 h-4" /> Export</button>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer"><Plus className="w-4 h-4" /> Add Staff</button>
        </div>
      </div>

      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label="Total Staff" value={summary.totalStaff} icon={<Users className="w-5 h-5" />} color="bg-indigo-50 text-indigo-600" />
          <SummaryCard label="Present Today" value={summary.presentToday} change={summary.totalStaff ? `${Math.round(summary.presentToday / summary.totalStaff * 100)}%` : '0%'} icon={<UserCheck className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" />
          <SummaryCard label="On Leave" value={summary.onLeave} icon={<UserX className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
          <SummaryCard label="Avg Rating" value={`${summary.averageRating} ⭐`} icon={<Star className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
        </div>
      )}

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}

      {/* Staff Header Tabs Navigation */}
      <StaffHeaderTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} />

      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by name, ID, or email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <button onClick={() => { setShowStatus(!showStatus); setShowRole(false); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 cursor-pointer"><ChevronDown className="w-4 h-4" />{statusFilter}</button>
                {showStatus && <Dropdown items={['All Status', 'Active', 'On Leave', 'Inactive']} selected={statusFilter} onSelect={(v: string) => { setStatusFilter(v); setShowStatus(false); }} />}
              </div>
              <div className="relative">
                <button onClick={() => { setShowRole(!showRole); setShowStatus(false); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 cursor-pointer"><ChevronDown className="w-4 h-4" />{roleFilter}</button>
                {showRole && <Dropdown items={['All Roles', 'Full-Time', 'Part-Time', 'Contract']} selected={roleFilter} onSelect={(v: string) => { setRoleFilter(v); setShowRole(false); }} />}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12"><RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 px-3">ID</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 px-3">Name</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 px-3">Role</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 px-3">Outlet</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 px-3">Designation</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 px-3">Status</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase pb-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-3"><span className="text-sm font-mono font-medium">{s.id}</span></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">{s.name.split(' ').map(n => n[0]).join('')}</div>
                          <div><p className="text-sm font-semibold text-slate-900">{s.name}</p><p className="text-xs text-slate-500">{s.email}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-3"><span className="text-sm">{s.role_type}</span></td>
                      <td className="py-3 px-3"><span className="text-sm">{s.outlet}</span></td>
                      <td className="py-3 px-3"><span className="text-sm">{s.designation}</span></td>
                      <td className="py-3 px-3"><span className={statusBadge(s.status)}>{s.status}</span></td>
                      <td className="py-3 px-3 text-right">
                        <button onClick={() => openEdit(s)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer inline-flex items-center gap-1"><Pencil className="w-4 h-4 text-indigo-500" /><span className="text-xs font-semibold text-indigo-600">Edit</span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No staff found</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && <StaffAttendanceView />}
      {activeTab === 'leave' && <StaffLeaveRequestsView />}
      {activeTab === 'performance' && <StaffPerformanceView />}

      {/* Edit Staff Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Edit Staff: {editModal.id}</h2>
              <button onClick={() => setEditModal(null)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Name</label>
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Email</label>
                <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Role Type</label>
                  <select value={editForm.roleType} onChange={e => setEditForm({...editForm, roleType: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none">
                    <option>Full-Time</option><option>Part-Time</option><option>Contract</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none">
                    <option>Active</option><option>On Leave</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Outlet</label>
                <input value={editForm.outlet} onChange={e => setEditForm({...editForm, outlet: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Designation</label>
                <input value={editForm.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer">Cancel</button>
                <button onClick={handleEditSave} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add Staff Member</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Full Name *" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              <input placeholder="Email *" type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              <input placeholder="Phone" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              <select value={createForm.roleType} onChange={e => setCreateForm({...createForm, roleType: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none"><option>Full-Time</option><option>Part-Time</option><option>Contract</option></select>
              <input placeholder="Outlet" value={createForm.outlet} onChange={e => setCreateForm({...createForm, outlet: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              <input placeholder="Designation" value={createForm.designation} onChange={e => setCreateForm({...createForm, designation: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer">Create Staff Member</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, change, icon, color }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
      {change && <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{change}</span>}
    </div>
    <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
    <h3 className="text-xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

const Dropdown = ({ items, selected, onSelect }: any) => (
  <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[160px] py-1">
    {items.map((item: string) => (
      <button key={item} onClick={() => onSelect(item)} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer ${selected === item ? 'text-indigo-600 font-semibold' : 'text-slate-700'}`}>{item}</button>
    ))}
  </div>
);

const Placeholder = ({ icon, title }: any) => (
  <div className="text-center py-12">
    <div className="w-12 h-12 text-slate-300 mx-auto mb-3">{icon}</div>
    <p className="text-slate-500 font-medium">{title}</p>
    <p className="text-sm text-slate-400 mt-1">Coming soon</p>
  </div>
);