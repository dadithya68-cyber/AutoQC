import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryItem {
  name: string;
  count: number;
  pct: number;
  color: string;
}

interface DefectsByCategoryChartProps {
  categories?: CategoryItem[];
  totalDefects?: number;
}

export const DefectsByCategoryChart: React.FC<DefectsByCategoryChartProps> = ({
  categories = [
    { name: 'Paint', count: 50, pct: 40, color: '#1685F8' },
    { name: 'Welding', count: 31, pct: 25, color: '#F59E0B' },
    { name: 'Assembly', count: 25, pct: 20, color: '#10B981' },
    { name: 'Electrical', count: 18, pct: 15, color: '#8B5CF6' }
  ],
  totalDefects = 124
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-2">
        <PieIcon className="w-5 h-5 text-[#1685F8]" />
        <h3 className="text-sm font-bold text-[#18345F] font-sans">
          Defects by Category
        </h3>
      </div>

      {/* Donut and Legend Flex container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 flex-1">
        {/* Donut Chart with center label */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} defects`, name]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#18345F'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-[#64748B] font-medium leading-none mb-1">
              Total Defects
            </span>
            <span className="text-2xl font-black text-[#18345F] leading-none">
              {totalDefects}
            </span>
          </div>
        </div>

        {/* Legend Table */}
        <div className="space-y-2.5 w-full sm:w-auto font-sans flex-1 max-w-[180px]">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-[#18345F]">{cat.name}</span>
              </div>
              <div className="flex items-center space-x-2 font-semibold">
                <span className="text-[#18345F]">{cat.count}</span>
                <span className="text-[11px] text-[#64748B] w-8 text-right">{cat.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
