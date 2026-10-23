import React from 'react';
import {
  QualityMetricsSummary,
  ParetoItem,
  LineQualityTrend,
  ZoneHeatmapItem
} from '../types';
import { KPICard } from '../components/KPICard';
import { ParetoDefectChart } from '../components/ParetoDefectChart';
import { FTQTrendChart } from '../components/FTQTrendChart';
import { ZoneHeatmap } from '../components/ZoneHeatmap';
import {
  TrendingUp,
  Activity,
  Award,
  IndianRupee,
  BarChart,
  FileSpreadsheet,
  Printer,
  ShieldCheck
} from 'lucide-react';

interface AnalyticsPageProps {
  metrics: QualityMetricsSummary;
  paretoData: ParetoItem[];
  trendsData: LineQualityTrend[];
  heatmapData: ZoneHeatmapItem[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  metrics,
  paretoData,
  trendsData,
  heatmapData
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
            Statistical Process Control (SPC) & Quality Analytics
          </h1>
          <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
            IATF 16949 / ISO 9001 Process Capability, DPMO defect density, and Pareto 80/20 trends
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#1685F8] text-[#18345F] hover:text-[#1685F8] text-xs font-semibold transition-all"
          >
            <Printer className="w-4 h-4 text-[#1685F8]" />
            <span>Export QA Shift Report</span>
          </button>
        </div>
      </div>

      {/* Primary SPC Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="FTQ First Time Quality"
          value={`${metrics.first_time_quality_pct}%`}
          target=">= 95.0%"
          delta={{ value: '+2.1%', isPositive: true }}
          status="nominal"
          icon={Award}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          subtext="World-class benchmark: > 96%"
        />

        <KPICard
          title="Defects Per Million (DPMO)"
          value={metrics.defects_per_million_opp.toLocaleString()}
          target="<= 15,000 DPMO"
          delta={{ value: '-3,200', isPositive: true }}
          status="nominal"
          icon={Activity}
          iconBgColor="#EAF2FF"
          iconColor="#1685F8"
          subtext="Sigma Level: 4.8 σ"
        />

        <KPICard
          title="Defects Per Unit (DPU)"
          value={metrics.defects_per_unit}
          target="<= 0.50 DPU"
          status="warning"
          icon={BarChart}
          iconBgColor="#FFFBEB"
          iconColor="#F59E0B"
          subtext="Avg defects per inspected vehicle"
        />

        <KPICard
          title="Cost of Poor Quality (COPQ)"
          value={`₹${metrics.total_copq_usd.toLocaleString('en-IN')}`}
          status="nominal"
          icon={IndianRupee}
          iconBgColor="#F5F3FF"
          iconColor="#8B5CF6"
          subtext="Includes scrap, labor, rework in INR (₹)"
        />
      </div>

      {/* Six Sigma Process Capability Box */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#EAF2FF] text-[#1685F8]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#18345F] tracking-tight">
              Process Capability Indices (Cp / Cpk)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            STATE: IN STATISTICAL CONTROL
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] font-medium text-[11px] block">Process Potential (Cp)</span>
            <span className="text-2xl font-extrabold text-[#1685F8] mt-1 block">1.67</span>
            <span className="text-[10px] text-[#94A3B8] block mt-1">Tolerance / 6σ spread</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] font-medium text-[11px] block">Process Capability (Cpk)</span>
            <span className="text-2xl font-extrabold text-[#10B981] mt-1 block">1.52</span>
            <span className="text-[10px] text-[#94A3B8] block mt-1">Mean centered in spec</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] font-medium text-[11px] block">Upper Spec Limit (USL)</span>
            <span className="text-2xl font-extrabold text-[#18345F] mt-1 block">+0.50 mm</span>
            <span className="text-[10px] text-[#94A3B8] block mt-1">Critical dimensional limit</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] font-medium text-[11px] block">Lower Spec Limit (LSL)</span>
            <span className="text-2xl font-extrabold text-[#18345F] mt-1 block">-0.50 mm</span>
            <span className="text-[10px] text-[#94A3B8] block mt-1">Critical dimensional limit</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FTQTrendChart data={trendsData} />
        <ParetoDefectChart data={paretoData} />
      </div>

      {/* Vehicle Anatomy Defect Heatmap */}
      <ZoneHeatmap data={heatmapData} />
    </div>
  );
};
