import React from 'react';
import { Defect } from '../types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface RecentDefectsTableProps {
  defects: Defect[];
  onViewAll?: () => void;
  onSelectDefect?: (defect: Defect) => void;
}

export const RecentDefectsTable: React.FC<RecentDefectsTableProps> = ({
  defects,
  onViewAll,
  onSelectDefect
}) => {
  // Render Severity Badge
  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]">
            High
          </span>
        );
      case 'MAJOR':
      case 'MEDIUM':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#F59E0B] border border-[#FEF3C7]">
            Medium
          </span>
        );
      case 'MINOR':
      case 'LOW':
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]">
            Low
          </span>
        );
    }
  };

  // Render Status Badge
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'IN_REVIEW':
      case 'IN REVIEW':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF2FF] text-[#1685F8] border border-[#DBEAFE]">
            In Review
          </span>
        );
      case 'ASSIGNED_REWORK':
      case 'REWORK':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#F59E0B] border border-[#FEF3C7]">
            Rework
          </span>
        );
      case 'ASSIGNED':
      case 'LOGGED':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF2FF] text-[#1685F8] border border-[#DBEAFE]">
            Assigned
          </span>
        );
      case 'CLOSED':
      case 'VERIFIED':
      case 'REWORK_COMPLETED':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#64748B]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-[#1685F8]" />
          <h3 className="text-sm font-bold text-[#18345F] font-sans">
            Recent Defects
          </h3>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#1685F8] hover:text-[#0D6EFD] flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="text-[#94A3B8] font-semibold text-[11px] border-b border-slate-100">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Line / Station</th>
              <th className="py-2.5 px-3">Defect</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {defects.slice(0, 5).map((defect) => (
              <tr
                key={defect.id}
                onClick={() => onSelectDefect && onSelectDefect(defect)}
                className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
              >
                <td className="py-3 px-3 font-semibold text-[#64748B] group-hover:text-[#1685F8]">
                  {defect.id}
                </td>
                <td className="py-3 px-3 font-medium text-[#18345F]">
                  {defect.station_name || defect.station_id}
                </td>
                <td className="py-3 px-3 text-[#475569] font-medium">
                  {defect.description.length > 25
                    ? `${defect.description.slice(0, 25)}...`
                    : defect.description}
                </td>
                <td className="py-3 px-3">
                  {getSeverityBadge(defect.severity)}
                </td>
                <td className="py-3 px-3">
                  {getStatusBadge(defect.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
