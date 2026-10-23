import React from 'react';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  changePct?: string;
  isPositive?: boolean; // whether the change direction is desirable (green)
  changeText?: string;
  trendColor?: string;
  trendData?: number[];
  target?: string;
  delta?: { value: string; isPositive: boolean };
  status?: string;
  subtext?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconBgColor = '#EAF2FF',
  iconColor = '#1685F8',
  changePct,
  isPositive = true,
  changeText = 'vs. yesterday',
  trendColor = '#1685F8',
  trendData,
  target,
  delta,
  subtext
}) => {
  // Use delta if changePct is not explicitly provided
  const displayChangePct = changePct || delta?.value || '+1.2%';
  const displayIsPositive = isPositive !== undefined ? isPositive : (delta?.isPositive ?? true);

  // Generate smooth SVG polyline / path from trendData or default fallback
  const chartData = trendData && trendData.length > 1 ? trendData : [10, 15, 12, 18, 14, 20, 24];
  const minVal = Math.min(...chartData);
  const maxVal = Math.max(...chartData);
  const range = maxVal - minVal || 1;

  const width = 120;
  const height = 40;
  const step = width / (chartData.length - 1);

  const points = chartData.map((val, idx) => {
    const x = idx * step;
    const y = height - ((val - minVal) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = points.reduce((acc, point, idx) => {
    if (idx === 0) return `M ${point}`;
    return `${acc} L ${point}`;
  }, '');

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-2xl" style={{ backgroundColor: iconBgColor }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-[#64748B] block">{title}</span>
          <div className="flex items-baseline justify-end space-x-1.5 mt-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs font-bold text-[#64748B]">{unit}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Delta change */}
        <div className="flex flex-col text-xs">
          <div className="flex items-center space-x-1">
            <span
              className={`flex items-center font-bold ${
                displayIsPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {displayIsPositive ? (
                <ArrowUp className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
              )}
              {displayChangePct}
            </span>
            <span className="text-[#94A3B8] text-[11px] font-medium">{target ? `(Target: ${target})` : changeText}</span>
          </div>
          {subtext && <span className="text-[10px] text-[#64748B] mt-0.5">{subtext}</span>}
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-24 h-8">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <path
              d={pathD}
              fill="none"
              stroke={trendColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Also export alias for backwards compatibility
export const KPICard = SummaryCard;
