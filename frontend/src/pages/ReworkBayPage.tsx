import React, { useState } from 'react';
import { ReworkOrder, Defect } from '../types';
import {
  Wrench,
  CheckCircle,
  Clock,
  IndianRupee,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ReworkBayPageProps {
  reworks: ReworkOrder[];
  defects: Defect[];
  onOpenReworkModal: (defect: Defect, rework?: ReworkOrder) => void;
  onVerifyRework: (reworkId: string, status: 'VERIFIED_PASS' | 'FAILED_RE_REWORK', verifier: string) => Promise<void>;
}

export const ReworkBayPage: React.FC<ReworkBayPageProps> = ({
  reworks,
  defects,
  onOpenReworkModal,
  onVerifyRework
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filter6M, setFilter6M] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredReworks = reworks.filter(r => {
    if (filterStatus !== 'ALL' && r.verification_status !== filterStatus) return false;
    if (filter6M !== 'ALL' && r.root_cause_category !== filter6M) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchVin = r.vin.toLowerCase().includes(q);
      const matchTech = r.technician_name.toLowerCase().includes(q);
      const matchRca = r.root_cause_analysis.toLowerCase().includes(q);
      if (!matchVin && !matchTech && !matchRca) return false;
    }
    return true;
  });

  // Calculate Ishikawa 6M counts
  const ishikawaCounts: Record<string, number> = {
    MACHINE: 0,
    MAN: 0,
    METHOD: 0,
    MATERIAL: 0,
    MEASUREMENT: 0,
    ENVIRONMENT: 0
  };
  reworks.forEach(r => {
    if (ishikawaCounts[r.root_cause_category] !== undefined) {
      ishikawaCounts[r.root_cause_category]++;
    }
  });

  const totalCost = reworks.reduce((acc, r) => acc + (Number(r.cost_copq) || 0), 0);
  const totalLabor = reworks.reduce((acc, r) => acc + (Number(r.labor_minutes) || 0), 0);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
            Rework Bay & Root Cause Analysis
          </h1>
          <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
            Containment, 5-Why problem solving, Cost of Poor Quality (COPQ), and QA re-inspection sign-off
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-[#64748B]">
            Total COPQ: <strong className="text-amber-600 font-bold">₹{totalCost.toLocaleString('en-IN')}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-[#64748B]">
            Total Labor: <strong className="text-[#1685F8] font-bold">{totalLabor} mins</strong>
          </div>
        </div>
      </div>

      {/* Ishikawa 6M Category Breakdown Grid */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#18345F] uppercase tracking-wide">
            <Layers className="w-4 h-4 text-[#1685F8]" />
            <span>Ishikawa 6M Root Cause Factor Distribution</span>
          </div>
          <span className="text-[11px] text-[#64748B]">Manufacturing Problem Solving</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['MACHINE', 'METHOD', 'MAN', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT'] as const).map(cat => {
            const count = ishikawaCounts[cat] || 0;
            const isSelected = filter6M === cat;

            return (
              <button
                key={cat}
                onClick={() => setFilter6M(isSelected ? 'ALL' : cat)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#EAF2FF] border-[#1685F8] text-[#1685F8] shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-[#18345F]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{cat}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    count > 0 ? (isSelected ? 'bg-[#1685F8] text-white' : 'bg-blue-100 text-[#1685F8]') : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B] mt-1 truncate">
                  {cat === 'MACHINE' ? 'Tooling / Robots' :
                   cat === 'METHOD' ? 'Process / SOP' :
                   cat === 'MAN' ? 'Operator execution' :
                   cat === 'MATERIAL' ? 'Batch / Supplier' :
                   cat === 'MEASUREMENT' ? 'Sensor / Gaging' : 'Booth Ambient'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by VIN, Technician, RCA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] text-[#18345F] text-xs rounded-xl pl-9 pr-3 py-2.5 shadow-sm focus:border-[#1685F8] focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(['ALL', 'PENDING', 'VERIFIED_PASS', 'FAILED_RE_REWORK'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-[#1685F8] text-white shadow-sm'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#18345F]'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Rework Orders List */}
      <div className="space-y-4">
        {filteredReworks.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-[#64748B] text-xs shadow-card">
            No rework orders found matching current criteria.
          </div>
        ) : (
          filteredReworks.map(order => {
            const relatedDefect = defects.find(d => d.id === order.defect_id);
            const isVerified = order.verification_status === 'VERIFIED_PASS';

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all ${
                  isVerified
                    ? 'border-emerald-200'
                    : 'border-[#E2E8F0]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-3 rounded-2xl ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-[#18345F]">{order.id}</span>
                        <span className="text-xs font-semibold text-[#1685F8]">• VIN: {order.vin}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.verification_status}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 font-sans">
                        Component: <strong className="text-[#18345F]">{relatedDefect?.component || 'Assembly Area'}</strong> • Category: <span className="text-[#64748B]">{relatedDefect?.category}</span>
                      </p>
                    </div>
                  </div>

                  {/* Technician & Costs */}
                  <div className="flex items-center space-x-6 text-xs">
                    <div>
                      <span className="text-[#94A3B8] uppercase text-[10px] font-bold block">Assigned Tech</span>
                      <span className="text-[#18345F] font-semibold">{order.technician_name}</span>
                    </div>

                    <div>
                      <span className="text-[#94A3B8] uppercase text-[10px] font-bold block">Labor Time</span>
                      <span className="text-[#1685F8] font-bold">{order.labor_minutes} mins</span>
                    </div>

                    <div>
                      <span className="text-[#94A3B8] uppercase text-[10px] font-bold block">COPQ Cost</span>
                      <span className="text-amber-600 font-bold">₹{order.cost_copq.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      onClick={() => relatedDefect && onOpenReworkModal(relatedDefect, order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1685F8] text-[#18345F] hover:text-[#1685F8] text-xs font-semibold transition-colors"
                    >
                      Edit Ticket
                    </button>
                  </div>
                </div>

                {/* 5-Why Root Cause & Corrective Action Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-sans">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase tracking-wider text-[#1685F8] font-bold block mb-1">
                      5-Why Root Cause Analysis (Factor: {order.root_cause_category})
                    </span>
                    <p className="text-[#18345F] leading-relaxed">{order.root_cause_analysis}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mb-1">
                      Corrective Action & Containment
                    </span>
                    <p className="text-[#18345F] leading-relaxed">{order.corrective_action}</p>
                  </div>
                </div>

                {/* Replaced Parts & Sign-off footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-[#64748B] text-[11px]">
                    <span>Replaced Components:</span>
                    {order.parts_replaced && order.parts_replaced.length > 0 ? (
                      order.parts_replaced.map((part, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-[#18345F] font-medium border border-slate-200">
                          {part}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None (adjustment/re-torqued)</span>
                    )}
                  </div>

                  {/* Sign-off button */}
                  {!isVerified && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onVerifyRework(order.id, 'VERIFIED_PASS', 'QA Inspector Sign-off')}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sign-off & Verify Pass</span>
                      </button>
                    </div>
                  )}

                  {isVerified && (
                    <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Certified by {order.verifier_name || 'QA Lead'} on {new Date(order.completed_at || order.started_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
