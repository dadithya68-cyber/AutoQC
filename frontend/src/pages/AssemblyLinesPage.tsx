import React from 'react';
import { AssemblyLine, Workstation, Vehicle } from '../types';
import { GitBranch, Play, Pause, AlertOctagon, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

interface AssemblyLinesPageProps {
  lines: AssemblyLine[];
  stations: Workstation[];
  vehicles: Vehicle[];
  onUpdateLineStatus: (lineId: string, status: 'RUNNING' | 'SLOWED' | 'HALTED') => Promise<void>;
}

export const AssemblyLinesPage: React.FC<AssemblyLinesPageProps> = ({
  lines,
  stations,
  vehicles,
  onUpdateLineStatus
}) => {
  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
            Plant Assembly Lines & Workstations
          </h1>
          <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
            End-to-end multi-shop assembly flow, station sequence, and real-time line pacing
          </p>
        </div>

        <div className="text-xs text-[#64748B] bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] shadow-sm">
          Total Lines: <strong className="text-[#1685F8] font-bold">{lines.length}</strong> • Stations: <strong className="text-[#18345F] font-bold">{stations.length}</strong>
        </div>
      </div>

      {/* Assembly Lines Cards */}
      <div className="space-y-6">
        {lines.map((line) => {
          const lineStations = stations.filter(s => s.line_id === line.id);
          const lineVehicles = vehicles.filter(v => v.current_line_id === line.id);
          const isHalted = line.current_status === 'HALTED';
          const isSlowed = line.current_status === 'SLOWED';

          return (
            <div
              key={line.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all ${
                isHalted
                  ? 'border-rose-300'
                  : isSlowed
                  ? 'border-amber-300'
                  : 'border-[#E2E8F0]'
              }`}
            >
              {/* Line Header */}
              <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-2xl bg-[#EAF2FF] text-[#1685F8]">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-[#1685F8]">
                        {line.code}
                      </span>
                      <h2 className="text-base font-bold text-[#18345F] tracking-tight">{line.name}</h2>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isHalted
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isSlowed
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {line.current_status}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{line.description}</p>
                  </div>
                </div>

                {/* Line Speed Controls & Metrics */}
                <div className="flex items-center space-x-6 text-xs">
                  <div>
                    <span className="text-[#94A3B8] uppercase text-[10px] font-bold block">Target Pacing</span>
                    <span className="text-[#18345F] font-bold">{line.target_hourly_rate} UPH</span>
                  </div>

                  <div>
                    <span className="text-[#94A3B8] uppercase text-[10px] font-bold block">Active WIP</span>
                    <span className="text-[#1685F8] font-bold">{lineVehicles.length} Units</span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <button
                      onClick={() => onUpdateLineStatus(line.id, 'RUNNING')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                        line.current_status === 'RUNNING'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-[#64748B] hover:text-[#18345F]'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      <span>Run</span>
                    </button>

                    <button
                      onClick={() => onUpdateLineStatus(line.id, 'SLOWED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                        line.current_status === 'SLOWED'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-[#64748B] hover:text-[#18345F]'
                      }`}
                    >
                      <Pause className="w-3 h-3" />
                      <span>Slow</span>
                    </button>

                    <button
                      onClick={() => onUpdateLineStatus(line.id, 'HALTED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                        line.current_status === 'HALTED'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-[#64748B] hover:text-[#18345F]'
                      }`}
                    >
                      <AlertOctagon className="w-3 h-3" />
                      <span>Halt</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Workstations Sequence Flow */}
              <div className="p-5">
                <span className="text-xs font-bold uppercase tracking-wide text-[#64748B] block mb-3">
                  Workstations & Quality Gate Sequence ({lineStations.length} Stations)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lineStations.map((station) => (
                    <div
                      key={station.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1685F8] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#1685F8] border border-slate-200">
                            SEQ #{station.sequence_order} • {station.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1685F8]">
                            {station.type}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#18345F] mt-2 font-sans">{station.name}</h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-[#64748B]">
                        <span>Checklist: {station.checklist_template?.length || 0} checks</span>
                        <span className="text-emerald-600 font-bold flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>ACTIVE GATE</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
