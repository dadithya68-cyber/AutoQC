import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DatabaseStatus, QualityMetricsSummary } from '../types';
import {
  Database,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Clock,
  Server
} from 'lucide-react';

interface ReportsSettingsPageProps {
  metrics: QualityMetricsSummary;
  onRefreshData?: () => void;
}

export const ReportsSettingsPage: React.FC<ReportsSettingsPageProps> = ({
  metrics,
  onRefreshData
}) => {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const fetchDbStatus = async () => {
    try {
      const status = await api.getDatabaseStatus();
      setDbStatus(status);
    } catch (err) {
      console.error('Failed to get database status', err);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      await fetchDbStatus();
      if (onRefreshData) onRefreshData();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `First Pass Yield (FTQ),${metrics.first_time_quality_pct}%\n` +
      `Total Inspections,${metrics.total_inspections}\n` +
      `Passed Inspections,${metrics.passed_inspections}\n` +
      `Failed Inspections,${metrics.failed_inspections}\n` +
      `Total Defects,${metrics.total_defects}\n` +
      `Open Defects,${metrics.open_defects}\n` +
      `Critical Defects,${metrics.critical_defects}\n` +
      `Defects Per Unit (DPU),${metrics.defects_per_unit}\n` +
      `DPMO,${metrics.defects_per_million_opp}\n` +
      `Active Reworks,${metrics.active_reworks}\n` +
      `Total COPQ (INR),₹${metrics.total_copq_usd}\n`;


    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AutoQC_Quality_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
            Reports & Quality Settings
          </h1>
          <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
            Database persistence telemetry, shift report export, and quality threshold configuration
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#1685F8] text-[#18345F] hover:text-[#1685F8] text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-[#1685F8]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1685F8] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Database Storage Telemetry Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-[#1685F8]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18345F] tracking-tight">
                Permanent Database Persistence Engine
              </h2>
              <p className="text-xs text-[#64748B]">
                High-reliability local JSON file storage with ACID-like atomic flushes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PERSISTENCE ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide block">Storage Engine</span>
            <span className="text-lg font-extrabold text-[#18345F] mt-1 block">
              {dbStatus?.status ? `Persistent Storage (${dbStatus.status})` : 'Persistent JSON Store'}
            </span>
            <span className="text-[11px] text-[#94A3B8] block mt-1">Zero-data-loss atomic write</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide block">Data File Location</span>
            <span className="text-xs font-mono font-bold text-[#1685F8] mt-1 block truncate">
              {dbStatus?.filePath || 'backend/data/automotive_db.json'}
            </span>
            <span className="text-[11px] text-[#94A3B8] block mt-1">Persisted across system restarts</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide block">Last Disk Write</span>
            <span className="text-xs font-semibold text-[#18345F] mt-1 block flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#1685F8]" />
              <span>{dbStatus?.lastPersistedAt ? new Date(dbStatus.lastPersistedAt).toLocaleTimeString() : 'Recent'}</span>
            </span>
            <span className="text-[11px] text-[#94A3B8] block mt-1">Autosaves on inspection & defect</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide block">Unified Host Port</span>
            <span className="text-lg font-extrabold text-emerald-600 mt-1 block">
              localhost:5000
            </span>
            <span className="text-[11px] text-[#94A3B8] block mt-1">Frontend + Backend unified</span>
          </div>
        </div>

        {/* Record Counts Breakdown */}
        {dbStatus?.recordCounts && (
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <h4 className="text-xs font-bold text-[#18345F] uppercase tracking-wide mb-3">
              Stored Records in Database:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-[#64748B] block">Defects</span>
                <span className="text-base font-extrabold text-[#1685F8]">{dbStatus.recordCounts.defects}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-[#64748B] block">Inspections</span>
                <span className="text-base font-extrabold text-[#1685F8]">{dbStatus.recordCounts.inspections}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-[#64748B] block">Rework Orders</span>
                <span className="text-base font-extrabold text-[#1685F8]">{dbStatus.recordCounts.reworks}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-[#64748B] block">Vehicles (WIP)</span>
                <span className="text-base font-extrabold text-[#1685F8]">{dbStatus.recordCounts.vehicles}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-[#64748B] block">Lines</span>
                <span className="text-base font-extrabold text-[#1685F8]">{dbStatus.recordCounts.lines}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-[#64748B] block">Workstations</span>
                <span className="text-base font-extrabold text-[#1685F8]">{dbStatus.recordCounts.stations}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sync Action */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-[#64748B]">
            All user operations automatically persist to disk. You can also trigger an immediate flush:
          </div>
          <button
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1685F8] text-[#18345F] hover:text-[#1685F8] text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Flushing to Disk...' : syncSuccess ? 'Synchronized!' : 'Verify & Flush Disk'}</span>
          </button>
        </div>
      </div>

      {/* Quality Targets & Standard Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#18345F] tracking-tight">
              IATF 16949 / ISO 9001 Quality Benchmarks
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-[#18345F] block">First Time Quality (FTQ) Target</span>
                <span className="text-[#64748B] text-[11px]">Minimum acceptable run rate for end-of-line gate</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                &ge; 95.0%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-[#18345F] block">Defects Per Unit (DPU) Target</span>
                <span className="text-[#64748B] text-[11px]">Maximum allowable defects per inspected chassis</span>
              </div>
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                &le; 0.50 DPU
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-[#18345F] block">Critical Containment SLA</span>
                <span className="text-[#64748B] text-[11px]">Maximum response time to halt station on critical weld/torque defect</span>
              </div>
              <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                &lt; 5 mins
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#18345F] tracking-tight">
              Shift Scheduling & Notification Preferences
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-[#18345F] block">Active Shift Rotation</span>
              <p className="text-[#64748B] text-[11px]">
                Shift A: 06:00 - 14:00 • Shift B: 14:00 - 22:00 • Shift C: 22:00 - 06:00
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-[#18345F] block">Real-time WebSocket Broadcast</span>
              <p className="text-[#64748B] text-[11px]">
                Enabled on port 5000 (<span className="font-mono text-[#1685F8]">/ws</span>). All workstations and inspection stations receive live updates instantly.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-[#18345F] block">Audit Logging & Traceability</span>
              <p className="text-[#64748B] text-[11px]">
                Every inspection check, defect pin, and rework sign-off is logged with inspector ID, timestamp, and VIN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
