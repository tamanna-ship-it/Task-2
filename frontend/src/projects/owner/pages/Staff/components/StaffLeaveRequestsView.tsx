import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/utils/authContext';
import { Search, ChevronDown, RefreshCw, UserCheck, UserX } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const StaffLeaveRequestsView: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showRoleDrop, setShowRoleDrop] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/owner/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setRequests(d.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: number, newStatus: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`${API}/owner/leave-requests/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, approverName: 'Rishita' })
      });
      if (res.ok) {
        const d = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? d.request : r));
      }
    } catch (err) {
      alert('Failed to update leave request');
    }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch = r.staff_name?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q) || r.designation?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All Status' || r.status === statusFilter;
    const matchesRole = roleFilter === 'All Roles' || r.role_type === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatDateRange = (r: any) => {
    const s = new Date(r.start_date);
    const e = new Date(r.end_date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let dateStr = `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
    if (r.start_date !== r.end_date) {
      dateStr = `${s.getDate()}-${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
    }
    if (r.half_day_type) {
      dateStr += ` (${r.half_day_type})`;
    }
    return dateStr;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'Pending':
      default:
        return 'bg-blue-50 text-blue-600 border border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Action Bar matching Image 3 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leave requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => { setShowStatusDrop(!showStatusDrop); setShowRoleDrop(false); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm text-slate-700 min-w-[120px] justify-between"
            >
              <span>{statusFilter === 'All Status' ? 'Status' : statusFilter}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showStatusDrop && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 min-w-[150px]">
                {['All Status', 'Pending', 'Approved', 'Rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowStatusDrop(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowRoleDrop(!showRoleDrop); setShowStatusDrop(false); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm text-slate-700 min-w-[130px] justify-between"
            >
              <span>{roleFilter}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showRoleDrop && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 min-w-[150px]">
                {['All Roles', 'Full-Time', 'Part-Time', 'Contract'].map(r => (
                  <button
                    key={r}
                    onClick={() => { setRoleFilter(r); setShowRoleDrop(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Requests Card List matching Image 3 */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading Leave Requests...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                {/* Column 1: Avatar & Staff Details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {r.staff_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{r.staff_name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{r.designation || 'Hair Stylist'}</p>
                  </div>
                </div>

                {/* Column 2: Leave Dates */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">LEAVE DATES</p>
                  <p className="text-sm font-medium text-slate-800">{formatDateRange(r)}</p>
                </div>

                {/* Column 3: Reason */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">REASON</p>
                  <p className="text-sm text-slate-700 truncate">{r.reason || 'No reason provided'}</p>
                </div>

                {/* Column 4: Actions or Approver Label */}
                <div className="flex items-center justify-start md:justify-end">
                  {r.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(r.id, 'Rejected')}
                        className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'Approved')}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  ) : r.status === 'Approved' ? (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-slate-400">Approved by</p>
                      <p className="text-xs font-bold text-slate-900">{r.approved_by || 'Rishita'}</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-slate-400">Rejected by</p>
                      <p className="text-xs font-bold text-slate-900">{r.rejected_by || 'Rishita'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
          <p className="font-semibold">No leave requests found</p>
        </div>
      )}
    </div>
  );
};
