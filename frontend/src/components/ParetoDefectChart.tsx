import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { ParetoItem } from '../types';
import { BarChart3 } from 'lucide-react';

interface ParetoDefectChartProps {
  data: ParetoItem[];
}

export const ParetoDefectChart: React.FC<ParetoDefectChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card flex flex-col h-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#EAF2FF] text-[#1685F8]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#18345F] tracking-tight">
              Pareto 80/20 Defect Distribution
            </h3>
            <p className="text-[11px] text-[#64748B]">Frequency vs Cumulative Impact Rate</p>
          </div>
        </div>

        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          80% CUTOFF LINE
        </div>
      </div>

      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="category"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              yAxisId="left"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              unit="%"
              stroke="#1685F8"
              fontSize={11}
              tickLine={false}
            />
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
            <ReferenceLine yAxisId="right" y={80} stroke="#F59E0B" strokeDasharray="4 4" />
            <Bar
              yAxisId="left"
              dataKey="count"
              name="Defect Count"
              fill="#1685F8"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative_percentage"
              name="Cumulative %"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#F59E0B' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
