import React, { useState } from 'react';
import { Defect, AssemblyLine, Workstation, DefectSeverity, DefectStatus } from '../types';
import {
  AlertTriangle,
  Search,
  Filter,
  Wrench,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface DefectRegistryPageProps {
  defects: Defect[];
  lines: AssemblyLine[];
  stations: Workstation[];
  onOpenReworkModal: (defect: Defect) => void;
  onUpdateDefectStatus: (defectId: string, status: DefectStatus) => Promise<void>;
  onSelectDefectForBlueprint: (defect: Defect) => void;
}

export const DefectRegistryPage: React.FC<DefectRegistryPageProps> = ({
  defects,
  lines,
  stations,
  onOpenReworkModal,
  onUpdateDefectStatus,
  onSelectDefectForBlueprint
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLine, setSelectedLine] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredDefects = defects.filter(d => {
    if (searchTerm) {
      const matchVin = d.vin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchComp = d.component.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = d.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchVin && !matchComp && !matchDesc) return false;
    }
    if (selectedSeverity !== 'ALL' && d.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
    if (selectedLine !== 'ALL' && d.line_id !== selectedLine) return false;
    if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]">
            <Flame className="w-3 h-3" />
            <span>High</span>
          </span>
        );
      case 'MAJOR':
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#F59E0B] border border-[#FEF3C7]">
            <span>Medium</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]">
            <span>Low</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
            Defect Registry & Quality Triage
          </h1>
          <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
            Real-time multi-line defect logging, severity containment, and rework dispatching
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-sans">
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#18345F] font-semibold shadow-sm">
            Total Registry: <strong className="text-[#1685F8]">{defects.length}</strong>
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] font-semibold">
            Open Critical: <strong>{defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#1685F8] uppercase tracking-wide">
          <Filter className="w-3.5 h-3.5" />
          <span>Triage Filters & VIN Lookup</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search VIN, component, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] text-xs rounded-xl pl-8 pr-3 py-2 focus:border-[#1685F8] focus:bg-white focus:outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Line Filter */}
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] text-xs rounded-xl px-3 py-2 focus:border-[#1685F8] focus:outline-none"
          >
            <option value="ALL">All Assembly Lines</option>
            {lines.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] text-xs rounded-xl px-3 py-2 focus:border-[#1685F8] focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">High (Safety / Stop)</option>
            <option value="MAJOR">Medium (Functional)</option>
            <option value="MINOR">Low (Cosmetic)</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] text-xs rounded-xl px-3 py-2 focus:border-[#1685F8] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="LOGGED">Assigned</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="ASSIGNED_REWORK">Rework</option>
            <option value="REWORK_COMPLETED">Rework Completed</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] text-xs rounded-xl px-3 py-2 focus:border-[#1685F8] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="PAINT">Paint & Clearcoat</option>
            <option value="BODY_WELD">Welding & Frame</option>
            <option value="DIMENSIONAL">Assembly Alignment</option>
            <option value="TORQUE">Fastener Torque</option>
            <option value="ELECTRICAL">Electrical & ADAS</option>
          </select>
        </div>
      </div>

      {/* Defects Data Grid */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold text-[11px] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Defect ID</th>
                <th className="py-3 px-4">Vehicle VIN</th>
                <th className="py-3 px-4">Line & Station</th>
                <th className="py-3 px-4">Component & Description</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDefects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B] font-medium">
                    No assembly defects matching query criteria
                  </td>
                </tr>
              ) : (
                filteredDefects.map((defect) => {
                  return (
                    <tr
                      key={defect.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#1685F8]">{defect.id}</td>

                      <td className="py-3.5 px-4 font-mono font-medium text-[#18345F]">
                        {defect.vin}
                      </td>

                      <td className="py-3.5 px-4 text-[#18345F]">
                        <div className="font-semibold">{defect.line_name || defect.line_id}</div>
                        <div className="text-[11px] text-[#64748B]">{defect.station_name || defect.station_id}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-[#18345F]">{defect.component}</div>
                        <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">{defect.description}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        {getSeverityBadge(defect.severity)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={defect.status}
                          onChange={(e) => onUpdateDefectStatus(defect.id, e.target.value as DefectStatus)}
                          className="bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] text-[11px] font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#1685F8]"
                        >
                          <option value="LOGGED">Assigned</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="ASSIGNED_REWORK">Rework</option>
                          <option value="REWORK_COMPLETED">Rework Completed</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        <div>{new Date(defect.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[10px] text-slate-400">{defect.logged_by.split(' ')[0]}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => onSelectDefectForBlueprint(defect)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#EAF2FF] text-[#1685F8] hover:bg-[#DBEAFE] text-[11px] font-semibold transition-all"
                          title="Show pin on vehicle blueprint"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Blueprint</span>
                        </button>

                        <button
                          onClick={() => onOpenReworkModal(defect)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FFFBEB] text-[#F59E0B] border border-[#FEF3C7] hover:bg-amber-100 text-[11px] font-bold transition-all"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Rework</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
