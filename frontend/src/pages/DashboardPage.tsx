import React from 'react';
import {
  DashboardSummary,
  StageStatus,
  ActivityEvent,
  HourlyDefectPoint,
  Defect
} from '../types';
import { SummaryCard } from '../components/KPICard';
import { LiveAssemblyLineStatus } from '../components/LiveAssemblyLineStatus';
import { LiveTelemetryFeed } from '../components/LiveTelemetryFeed';
import { DefectRateHistoryChart } from '../components/DefectRateHistoryChart';
import { DefectsByCategoryChart } from '../components/DefectsByCategoryChart';
import { RecentDefectsTable } from '../components/RecentDefectsTable';
import { Factory, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

interface DashboardPageProps {
  summary: DashboardSummary;
  stages: StageStatus[];
  activities: ActivityEvent[];
  defectRateHistory: HourlyDefectPoint[];
  defects: Defect[];
  onNavigateTab: (tab: string) => void;
  onSelectDefect?: (defect: Defect) => void;
  onStageClick?: (stage: StageStatus) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  stages,
  activities,
  defectRateHistory,
  defects,
  onNavigateTab,
  onSelectDefect,
  onStageClick
}) => {
  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
          Control Dashboard
        </h1>
        <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
          Overall plant performance and quality at a glance
        </p>
      </div>

      {/* 1. Four Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Production */}
        <SummaryCard
          title="Total Production"
          value={summary.totalProduction.value.toLocaleString()}
          unit={summary.totalProduction.unit}
          icon={Factory}
          iconBgColor="#EAF2FF"
          iconColor="#1685F8"
          changePct={summary.totalProduction.changePct}
          isPositive={summary.totalProduction.isPositive}
          trendColor="#1685F8"
          trendData={summary.totalProduction.trend}
        />

        {/* Defect Rate */}
        <SummaryCard
          title="Defect Rate"
          value={`${summary.defectRate.value}%`}
          icon={AlertTriangle}
          iconBgColor="#FEF2F2"
          iconColor="#EF4444"
          changePct={summary.defectRate.changePct}
          isPositive={summary.defectRate.isPositive}
          trendColor="#EF4444"
          trendData={summary.defectRate.trend}
        />

        {/* First Pass Yield */}
        <SummaryCard
          title="First Pass Yield"
          value={`${summary.firstPassYield.value}%`}
          icon={CheckCircle}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          changePct={summary.firstPassYield.changePct}
          isPositive={summary.firstPassYield.isPositive}
          trendColor="#10B981"
          trendData={summary.firstPassYield.trend}
        />

        {/* Open Defects */}
        <SummaryCard
          title="Open Defects"
          value={summary.openDefects.value}
          icon={Flame}
          iconBgColor="#FFFBEB"
          iconColor="#F59E0B"
          changePct={summary.openDefects.changePct}
          isPositive={summary.openDefects.isPositive}
          trendColor="#F59E0B"
          trendData={summary.openDefects.trend}
        />
      </div>

      {/* 2. Middle Row: Live Assembly Line Status + Live Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Central 3-column Live Assembly Line Status */}
        <div className="xl:col-span-3">
          <LiveAssemblyLineStatus
            stages={stages}
            onViewAll={() => onNavigateTab('lines')}
            onStageClick={onStageClick}
          />
        </div>

        {/* Right 1-column Live Activity Feed */}
        <div className="xl:col-span-1">
          <LiveTelemetryFeed
            initialEvents={activities}
            onViewAll={() => onNavigateTab('defects')}
          />
        </div>
      </div>

      {/* 3. Bottom Row: 3 Quality Analytics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Panel A: Defect Rate — Last 8 Hours */}
        <div>
          <DefectRateHistoryChart
            data={defectRateHistory}
            currentRate={summary.defectRate.value}
          />
        </div>

        {/* Panel B: Defects by Category */}
        <div>
          <DefectsByCategoryChart
            categories={[
              { name: 'Paint', count: 50, pct: 40, color: '#1685F8' },
              { name: 'Welding', count: 31, pct: 25, color: '#F59E0B' },
              { name: 'Assembly', count: 25, pct: 20, color: '#10B981' },
              { name: 'Electrical', count: 18, pct: 15, color: '#8B5CF6' }
            ]}
            totalDefects={124}
          />
        </div>

        {/* Panel C: Recent Defects Table */}
        <div>
          <RecentDefectsTable
            defects={defects}
            onViewAll={() => onNavigateTab('defects')}
            onSelectDefect={onSelectDefect}
          />
        </div>
      </div>
    </div>
  );
};
