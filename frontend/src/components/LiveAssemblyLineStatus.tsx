import React from 'react';
import { StageStatus } from '../types';
import { ArrowRight, Wrench, Paintbrush, Cog, CheckCircle2 } from 'lucide-react';

interface LiveAssemblyLineStatusProps {
  stages: StageStatus[];
  onViewAll?: () => void;
  onStageClick?: (stage: StageStatus) => void;
}

export const LiveAssemblyLineStatus: React.FC<LiveAssemblyLineStatusProps> = ({
  stages,
  onViewAll,
  onStageClick
}) => {
  const getStatusBadge = (status: 'Normal' | 'Attention' | 'Issue') => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>Normal</span>
          </span>
        );
      case 'Attention':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#F59E0B] border border-[#FEF3C7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span>Attention</span>
          </span>
        );
      case 'Issue':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
            <span>Issue</span>
          </span>
        );
    }
  };

  const getStageIcon = (type: string) => {
    switch (type) {
      case 'body':
        return <Wrench className="w-4 h-4 text-[#1685F8]" />;
      case 'paint':
        return <Paintbrush className="w-4 h-4 text-[#1685F8]" />;
      case 'assembly':
        return <Cog className="w-4 h-4 text-[#1685F8]" />;
      case 'qc':
        return <CheckCircle2 className="w-4 h-4 text-[#1685F8]" />;
      default:
        return <Wrench className="w-4 h-4 text-[#1685F8]" />;
    }
  };

  // Render automotive illustrations matching the reference photo
  const renderIllustration = (type: string) => {
    switch (type) {
      case 'body':
        return (
          <svg viewBox="0 0 320 140" className="w-full h-full rounded-xl bg-[#F0F6FF]">
            {/* Background assembly shop frame */}
            <rect x="0" y="0" width="320" height="140" fill="#EDF4FC" />
            <line x1="20" y1="120" x2="300" y2="120" stroke="#CBD5E1" strokeWidth="3" />
            <line x1="20" y1="126" x2="300" y2="126" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8 6" />

            {/* Left Robotic Weld Arm (Yellow/Orange) */}
            <rect x="35" y="100" width="24" height="20" rx="3" fill="#64748B" />
            <path d="M 47 100 L 47 65 L 75 50 L 95 65" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="47" cy="65" r="5" fill="#18345F" />
            <circle cx="75" cy="50" r="5" fill="#18345F" />
            <polygon points="95,65 102,68 98,74 91,71" fill="#475569" />
            <line x1="97" y1="72" x2="105" y2="82" stroke="#EF4444" strokeWidth="2" />
            <circle cx="106" cy="83" r="3" fill="#F59E0B" className="animate-ping" />

            {/* Right Robotic Weld Arm */}
            <rect x="260" y="100" width="24" height="20" rx="3" fill="#64748B" />
            <path d="M 272 100 L 272 65 L 245 50 L 225 65" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="272" cy="65" r="5" fill="#18345F" />
            <circle cx="245" cy="50" r="5" fill="#18345F" />
            <polygon points="225,65 218,68 222,74 229,71" fill="#475569" />
            <line x1="223" y1="72" x2="215" y2="82" stroke="#EF4444" strokeWidth="2" />
            <circle cx="214" cy="83" r="3" fill="#F59E0B" className="animate-ping" />

            {/* White Sedan Chassis Outline */}
            <path
              d="M 100 105 L 125 105 C 130 92, 150 92, 155 105 L 210 105 C 215 92, 235 92, 240 105 L 255 105 C 260 92, 255 78, 245 72 L 220 58 L 165 58 L 135 72 L 105 76 C 98 82, 96 95, 100 105 Z"
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth="2.5"
            />
            {/* Windows */}
            <path d="M 142 70 L 168 62 L 192 62 L 192 72 L 142 72 Z" fill="#BAE6FD" stroke="#64748B" strokeWidth="1.5" />
            <path d="M 196 62 L 216 62 L 236 72 L 196 72 Z" fill="#BAE6FD" stroke="#64748B" strokeWidth="1.5" />
            {/* Wheels */}
            <circle cx="140" cy="105" r="14" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="140" cy="105" r="6" fill="#E2E8F0" />
            <circle cx="225" cy="105" r="14" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="225" cy="105" r="6" fill="#E2E8F0" />
          </svg>
        );

      case 'paint':
        return (
          <svg viewBox="0 0 320 140" className="w-full h-full rounded-xl bg-[#F0FDF4]">
            {/* Paint booth tunnel enclosure */}
            <rect x="0" y="0" width="320" height="140" fill="#EBF7FE" />
            {/* Tunnel Arch */}
            <path d="M 40 120 L 40 30 C 40 20, 50 15, 60 15 L 260 15 C 270 15, 280 20, 280 30 L 280 120" fill="none" stroke="#93C5FD" strokeWidth="3" />
            <line x1="50" y1="30" x2="50" y2="120" stroke="#BAE6FD" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="270" y1="30" x2="270" y2="120" stroke="#BAE6FD" strokeWidth="2" strokeDasharray="4 4" />
            {/* Overhead spray nozzles */}
            <rect x="110" y="15" width="100" height="8" fill="#3B82F6" rx="2" />
            <circle cx="130" cy="27" r="3" fill="#1685F8" />
            <circle cx="160" cy="27" r="3" fill="#1685F8" />
            <circle cx="190" cy="27" r="3" fill="#1685F8" />
            {/* Spray mist particles */}
            <path d="M 125 32 L 115 55 M 135 32 L 145 55" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />
            <path d="M 155 32 L 145 55 M 165 32 L 175 55" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />
            <path d="M 185 32 L 175 55 M 195 32 L 205 55" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />

            {/* Blue Painted Sedan */}
            <path
              d="M 95 105 L 120 105 C 125 92, 145 92, 150 105 L 215 105 C 220 92, 240 92, 245 105 L 260 105 C 265 92, 260 78, 250 72 L 225 58 L 165 58 L 135 72 L 100 76 C 93 82, 91 95, 95 105 Z"
              fill="#2563EB"
              stroke="#1D4ED8"
              strokeWidth="2.5"
            />
            {/* Windows */}
            <path d="M 142 70 L 168 62 L 192 62 L 192 72 L 142 72 Z" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="1.5" />
            <path d="M 196 62 L 216 62 L 236 72 L 196 72 Z" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="1.5" />
            {/* Wheels */}
            <circle cx="135" cy="105" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
            <circle cx="135" cy="105" r="6" fill="#94A3B8" />
            <circle cx="230" cy="105" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
            <circle cx="230" cy="105" r="6" fill="#94A3B8" />
          </svg>
        );

      case 'assembly':
        return (
          <svg viewBox="0 0 320 140" className="w-full h-full rounded-xl bg-[#F0F6FF]">
            {/* Assembly Line conveyor */}
            <rect x="0" y="0" width="320" height="140" fill="#EDF4FC" />
            <line x1="20" y1="120" x2="300" y2="120" stroke="#CBD5E1" strokeWidth="3" />
            {/* Overhead gantry tooling */}
            <line x1="40" y1="20" x2="280" y2="20" stroke="#64748B" strokeWidth="4" />
            <rect x="150" y="20" width="20" height="25" fill="#F59E0B" />
            <line x1="160" y1="45" x2="160" y2="60" stroke="#475569" strokeWidth="3" />
            <circle cx="160" cy="62" r="4" fill="#10B981" />

            {/* Robotic Arm left */}
            <path d="M 45 110 L 45 75 L 75 60 L 95 72" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="75" cy="60" r="4" fill="#18345F" />
            <circle cx="95" cy="72" r="3" fill="#64748B" />

            {/* Robotic Arm right */}
            <path d="M 275 110 L 275 75 L 245 60 L 225 72" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="245" cy="60" r="4" fill="#18345F" />
            <circle cx="225" cy="72" r="3" fill="#64748B" />

            {/* Silver Car on Assembly */}
            <path
              d="M 98 105 L 122 105 C 128 92, 148 92, 153 105 L 212 105 C 217 92, 237 92, 242 105 L 257 105 C 262 92, 257 78, 247 72 L 222 58 L 165 58 L 135 72 L 103 76 C 96 82, 94 95, 98 105 Z"
              fill="#CBD5E1"
              stroke="#64748B"
              strokeWidth="2.5"
            />
            {/* Windows */}
            <path d="M 142 70 L 168 62 L 192 62 L 192 72 L 142 72 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
            <path d="M 196 62 L 216 62 L 236 72 L 196 72 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
            {/* Wheels */}
            <circle cx="138" cy="105" r="14" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="138" cy="105" r="6" fill="#E2E8F0" />
            <circle cx="228" cy="105" r="14" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="228" cy="105" r="6" fill="#E2E8F0" />
          </svg>
        );

      case 'qc':
        return (
          <svg viewBox="0 0 320 140" className="w-full h-full rounded-xl bg-[#F0F6FF]">
            {/* Final QC Light Tunnel */}
            <rect x="0" y="0" width="320" height="140" fill="#EDF4FC" />
            {/* Inspection LED light bars */}
            <rect x="35" y="15" width="8" height="105" fill="#38BDF8" rx="2" />
            <rect x="75" y="15" width="8" height="105" fill="#38BDF8" rx="2" />
            <rect x="235" y="15" width="8" height="105" fill="#38BDF8" rx="2" />
            <line x1="20" y1="120" x2="300" y2="120" stroke="#CBD5E1" strokeWidth="3" />

            {/* Digital Diagnostic Terminal on Right */}
            <rect x="255" y="60" width="36" height="28" rx="4" fill="#18345F" stroke="#1685F8" strokeWidth="1.5" />
            <rect x="259" y="64" width="28" height="20" rx="2" fill="#0284C7" />
            <line x1="262" y1="70" x2="284" y2="70" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="262" y1="75" x2="278" y2="75" stroke="#7DD3FC" strokeWidth="1.5" />
            <line x1="273" y1="88" x2="273" y2="105" stroke="#64748B" strokeWidth="3" />
            <rect x="265" y="105" width="16" height="5" fill="#475569" rx="1" />

            {/* Finished White Sedan */}
            <path
              d="M 90 105 L 115 105 C 120 92, 140 92, 145 105 L 205 105 C 210 92, 230 92, 235 105 L 250 105 C 255 92, 250 78, 240 72 L 215 58 L 155 58 L 125 72 L 95 76 C 88 82, 86 95, 90 105 Z"
              fill="#FFFFFF"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
            {/* Windows */}
            <path d="M 132 70 L 158 62 L 182 62 L 182 72 L 132 72 Z" fill="#BAE6FD" stroke="#64748B" strokeWidth="1.5" />
            <path d="M 186 62 L 206 62 L 226 72 L 186 72 Z" fill="#BAE6FD" stroke="#64748B" strokeWidth="1.5" />
            {/* Wheels */}
            <circle cx="130" cy="105" r="14" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="130" cy="105" r="6" fill="#38BDF8" />
            <circle cx="218" cy="105" r="14" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="218" cy="105" r="6" fill="#38BDF8" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-bold text-[#18345F] tracking-tight font-sans">
            Live Assembly Line Status
          </h2>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>All Systems Operational</span>
          </span>
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

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          return (
            <div
              key={stage.id}
              onClick={() => onStageClick && onStageClick(stage)}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between cursor-pointer"
            >
              {/* Card Title & Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-[#EAF2FF]">
                    {getStageIcon(stage.stageType)}
                  </div>
                  <span className="font-bold text-sm text-[#18345F] font-sans">
                    {stage.name}
                  </span>
                </div>
                {getStatusBadge(stage.status)}
              </div>

              {/* Manufacturing Illustration */}
              <div className="w-full h-28 rounded-xl overflow-hidden mb-3 border border-slate-100">
                {renderIllustration(stage.stageType)}
              </div>

              {/* Line and Station Info */}
              <div className="text-xs text-[#64748B] font-medium flex items-center space-x-2 mb-2">
                <span>{stage.lineCode}</span>
                <span>|</span>
                <span>{stage.stationCode}</span>
              </div>

              {/* Target & Actual Throughput */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#64748B]">
                  Target: <strong className="text-[#18345F]">{stage.targetHourly}/hr</strong>
                </span>
                <span className="text-[#64748B]">
                  Actual: <strong className="text-[#18345F]">{stage.actualHourly}/hr</strong>
                </span>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                  <span className="text-[10px] text-slate-400">Line Efficiency</span>
                  <span
                    className={
                      stage.efficiency >= 98
                        ? 'text-[#10B981]'
                        : stage.efficiency >= 90
                        ? 'text-[#0284C7]'
                        : 'text-[#EF4444]'
                    }
                  >
                    {stage.efficiency}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stage.efficiency >= 98
                        ? 'bg-[#10B981]'
                        : stage.efficiency >= 90
                        ? 'bg-[#0284C7]'
                        : 'bg-[#EF4444]'
                    }`}
                    style={{ width: `${stage.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
