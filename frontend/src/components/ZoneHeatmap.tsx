import React from 'react';
import { ZoneHeatmapItem } from '../types';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface ZoneHeatmapProps {
  data: ZoneHeatmapItem[];
  onZoneClick?: (zone: string) => void;
}

export const ZoneHeatmap: React.FC<ZoneHeatmapProps> = ({ data, onZoneClick }) => {
  const getDensityColor = (count: number, critical: number) => {
    if (critical > 0) {
      return 'bg-rose-50 border-rose-200 text-rose-800';
    }
    if (count >= 3) {
      return 'bg-amber-50 border-amber-200 text-amber-800';
    }
    if (count > 0) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    return 'bg-slate-50 border-slate-200 text-slate-600';
  };

  const getBadgeColor = (count: number, critical: number) => {
    if (critical > 0) return 'bg-rose-600 text-white font-bold animate-pulse';
    if (count >= 3) return 'bg-amber-500 text-white font-bold';
    if (count > 0) return 'bg-[#1685F8] text-white font-bold';
    return 'bg-slate-200 text-slate-600';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card flex flex-col h-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#18345F] tracking-tight">
            Vehicle Anatomy Defect Heatmap
          </h3>
          <p className="text-[11px] text-[#64748B]">Defect Density & Critical Hotspots by Sub-assembly</p>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-sans">
          <span className="flex items-center space-x-1 text-[#64748B]">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> <span>Nominal</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> <span>Elevated</span>
          </span>
          <span className="flex items-center space-x-1 text-rose-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> <span>Critical Hotspot</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
        {data.map((item) => (
          <div
            key={item.zone}
            onClick={() => onZoneClick && onZoneClick(item.zone)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between ${getDensityColor(
              item.defect_count,
              item.critical_count
            )}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold tracking-tight">{item.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getBadgeColor(item.defect_count, item.critical_count)}`}>
                {item.defect_count}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-medium opacity-85">
              <span>Zone: {item.zone}</span>
              {item.critical_count > 0 && (
                <span className="text-rose-600 font-bold flex items-center space-x-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{item.critical_count} CRIT</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
