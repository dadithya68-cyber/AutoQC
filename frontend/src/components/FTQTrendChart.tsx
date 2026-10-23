import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { LineQualityTrend } from '../types';
import { TrendingUp } from 'lucide-react';

interface FTQTrendChartProps {
  data: LineQualityTrend[];
}

export const FTQTrendChart: React.FC<FTQTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card flex flex-col h-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#18345F] tracking-tight">
              First Time Quality (FTQ %) Trend
            </h3>
            <p className="text-[11px] text-[#64748B]">Shift Run Rate vs 95.0% Quality Target</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            TARGET: 95.0%
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ftqGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="time_bucket" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis domain={[85, 100]} unit="%" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#18345F',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}
            />
            <ReferenceLine y={95} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Target 95%', fill: '#10B981', fontSize: 10, position: 'right' }} />
            <Area
              type="monotone"
              dataKey="ftq_rate"
              name="FTQ %"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#ftqGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
