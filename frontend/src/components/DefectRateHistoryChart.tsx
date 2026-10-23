import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { HourlyDefectPoint } from '../types';

interface DefectRateHistoryChartProps {
  data?: HourlyDefectPoint[];
  currentRate?: number;
}

export const DefectRateHistoryChart: React.FC<DefectRateHistoryChartProps> = ({
  data = [
    { time: '08:00', rate: 3.7 },
    { time: '09:00', rate: 3.2 },
    { time: '10:00', rate: 2.9 },
    { time: '11:00', rate: 3.0 },
    { time: '12:00', rate: 3.4 },
    { time: '13:00', rate: 2.9 },
    { time: '14:00', rate: 3.0 },
    { time: '15:00', rate: 3.2 },
    { time: '16:00', rate: 2.6 }
  ],
  currentRate = 2.4
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-[#1685F8]" />
          <h3 className="text-sm font-bold text-[#18345F] font-sans">
            Defect Rate — Last 8 Hours
          </h3>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#EAF2FF] border border-[#DBEAFE] text-[11px] font-bold text-[#1685F8]">
          <span className="text-[10px] text-[#64748B] font-medium">Current</span>
          <span>{currentRate}%</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1685F8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1685F8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              domain={[0, 6]}
              unit="%"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              ticks={[0, 1, 2, 3, 4, 5, 6]}
            />
            <Tooltip
              formatter={(val: any) => [`${val}%`, 'Defect Rate']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#18345F',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              name="Defect Rate"
              stroke="#1685F8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#rateGradient)"
              dot={{ r: 3.5, fill: '#1685F8', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#1685F8', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
