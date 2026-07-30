import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/utils/authContext';
import { Download, ChevronDown, ChevronRight, Calendar, Filter, Users, DollarSign, BarChart3, ArrowUp, ArrowDown, Maximize2, Minimize2, FileText, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const ReportsPage: React.FC = () => {
  const { token } = useAuth();
  const [kpis, setKpis] = useState<any[]>([]);
  const [salesReports, setSalesReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('This Month');
  const [staffFilter, setStaffFilter] = useState('All Staff');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [showPeriod, setShowPeriod] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showModule, setShowModule] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (staffFilter !== 'All Staff') params.set('staff', staffFilter);
      if (categoryFilter !== 'All Categories') params.set('category', categoryFilter);
      if (moduleFilter !== 'All Modules') params.set('module', moduleFilter);
      const res = await fetch(`${API}/owner/reports?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const d = await res.json();
      setKpis(d.kpis || []);
      setSalesReports(d.salesReports || []);
    } catch (err: any) { console.error(err); }
    finally { setLoading(false); }
  }, [token, period, staffFilter, categoryFilter, moduleFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const toggleExpand = (id: string) => {
    const newExp = { ...expanded, [id]: !expanded[id] };
    setExpanded(newExp);
  };

  const toggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    const newExp: Record<string, boolean> = {};
    salesReports.forEach(r => { newExp[r.id] = newState; });
    setExpanded(newExp);
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API}/owner/reports/export?period=${period}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `reports-${period.toLowerCase().replace(' ', '-')}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Comprehensive business analytics and performance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm">
            {allExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}{allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-sm">
            <Download className="w-4 h-4" /> Export All
          </button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" /><span className="text-sm font-semibold text-slate-700">Global Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdownBtn label={period} open={showPeriod} onClick={() => { setShowPeriod(!showPeriod); setShowStaff(false); setShowCategory(false); setShowModule(false); }}>
            {showPeriod && <DropMenu items={['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'This Quarter', 'This Year']} selected={period} onSelect={(v: string) => { setPeriod(v); setShowPeriod(false); }} />}
          </FilterDropdownBtn>
          <FilterDropdownBtn label={staffFilter} open={showStaff} onClick={() => { setShowStaff(!showStaff); setShowPeriod(false); setShowCategory(false); setShowModule(false); }}>
            {showStaff && <DropMenu items={['All Staff', 'Priya Sharma', 'Amit Patel', 'Neha Gupta', 'Rajesh Kumar', 'Sneha Reddy', 'Vikram Singh']} selected={staffFilter} onSelect={(v: string) => { setStaffFilter(v); setShowStaff(false); }} />}
          </FilterDropdownBtn>
          <FilterDropdownBtn label={categoryFilter} open={showCategory} onClick={() => { setShowCategory(!showCategory); setShowPeriod(false); setShowStaff(false); setShowModule(false); }}>
            {showCategory && <DropMenu items={['All Categories', 'Services', 'Retail', 'Memberships']} selected={categoryFilter} onSelect={(v: string) => { setCategoryFilter(v); setShowCategory(false); }} />}
          </FilterDropdownBtn>
          <FilterDropdownBtn label={moduleFilter} open={showModule} onClick={() => { setShowModule(!showModule); setShowPeriod(false); setShowStaff(false); setShowCategory(false); }}>
            {showModule && <DropMenu items={['All Modules', 'Sales', 'Appointments', 'Staff', 'Customers']} selected={moduleFilter} onSelect={(v: string) => { setModuleFilter(v); setShowModule(false); }} />}
          </FilterDropdownBtn>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{kpi.value}</h3>
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">vs Last Period</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${kpi.changePeriod >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kpi.changePeriod >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {kpi.changePeriod >= 0 ? '+' : ''}{kpi.changePeriod}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">vs Last Month</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${kpi.changeMonth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kpi.changeMonth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {kpi.changeMonth >= 0 ? '+' : ''}{kpi.changeMonth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sales Reports */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sales Reports</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Branch-wise sales performance breakdown</p>
                </div>
                <span className="text-xs text-slate-500">Period: {period}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {salesReports.map((report: any) => (
                <div key={report.id}>
                  <button onClick={() => toggleExpand(report.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors text-left cursor-pointer">
                    <div className="flex items-center gap-3">
                      {expanded[report.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{report.title}</h3>
                        <p className="text-xs text-slate-500">{report.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right"><p className="text-sm font-bold text-slate-900">{report.metrics.revenue}</p><p className="text-xs text-slate-500">Revenue</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-slate-900">{report.metrics.bookings}</p><p className="text-xs text-slate-500">Bookings</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-slate-900">{report.metrics.avgTicket}</p><p className="text-xs text-slate-500">Avg Ticket</p></div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${report.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {report.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{report.change >= 0 ? '+' : ''}{report.change}%
                      </span>
                    </div>
                  </button>
                  {expanded[report.id] && (
                    <div className="px-4 pb-4 pl-12">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Services Revenue</p>
                            <p className="text-sm font-bold text-slate-900">₹{Math.round(parseInt(report.metrics.revenue.replace(/[₹,]/g, '')) * 0.66).toLocaleString('en-IN')}</p>
                            <span className="text-xs text-emerald-600 font-medium">+14.2%</span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Retail Revenue</p>
                            <p className="text-sm font-bold text-slate-900">₹{Math.round(parseInt(report.metrics.revenue.replace(/[₹,]/g, '')) * 0.22).toLocaleString('en-IN')}</p>
                            <span className="text-xs text-emerald-600 font-medium">+9.8%</span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Membership Revenue</p>
                            <p className="text-sm font-bold text-slate-900">₹{Math.round(parseInt(report.metrics.revenue.replace(/[₹,]/g, '')) * 0.12).toLocaleString('en-IN')}</p>
                            <span className="text-xs text-emerald-600 font-medium">+22.4%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {salesReports.length === 0 && (
                <div className="text-center py-12 text-slate-500">No sales data for this period</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FilterDropdownBtn = ({ label, children, onClick }: any) => (
  <div className="relative">
    <button onClick={onClick} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 cursor-pointer"><ChevronDown className="w-4 h-4 text-slate-400" />{label}</button>
    {children}
  </div>
);

const DropMenu = ({ items, selected, onSelect }: any) => (
  <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[180px] py-1">
    {items.map((item: string) => (
      <button key={item} onClick={() => onSelect(item)} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer ${selected === item ? 'text-indigo-600 font-semibold' : 'text-slate-700'}`}>{item}</button>
    ))}
  </div>
);