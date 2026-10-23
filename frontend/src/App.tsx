import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { socketClient } from './services/socket';
import {
  AssemblyLine,
  Workstation,
  Vehicle,
  Defect,
  Inspection,
  ReworkOrder,
  QualityMetricsSummary,
  ParetoItem,
  LineQualityTrend,
  ZoneHeatmapItem,
  ShiftType,
  VehicleZone,
  DefectStatus,
  DashboardSummary,
  StageStatus,
  ActivityEvent,
  HourlyDefectPoint,
  User
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InspectionStationPage } from './pages/InspectionStationPage';
import { VehicleBlueprintPage } from './pages/VehicleBlueprintPage';
import { DefectRegistryPage } from './pages/DefectRegistryPage';
import { ReworkBayPage } from './pages/ReworkBayPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssemblyLinesPage } from './pages/AssemblyLinesPage';
import { ReportsSettingsPage } from './pages/ReportsSettingsPage';
import { LiveAssemblyLineStatus } from './components/LiveAssemblyLineStatus';
import { DefectPinModal } from './components/DefectPinModal';
import { ReworkModal } from './components/ReworkModal';
import { NewVehicleModal } from './components/NewVehicleModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('autoqc_user') || sessionStorage.getItem('autoqc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentShift, setCurrentShift] = useState<ShiftType>('Shift A (Morning)');
  const [isLoading, setIsLoading] = useState<boolean>(true);


  // AutoQC Dashboard Reference Data States
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    totalProduction: {
      value: 1248,
      unit: 'units',
      changePct: '+5.4%',
      isPositive: true,
      trend: [1180, 1205, 1220, 1235, 1248]
    },
    defectRate: {
      value: 2.4,
      unit: '%',
      changePct: '-0.3%',
      isPositive: true,
      trend: [2.8, 2.6, 2.5, 2.5, 2.4]
    },
    firstPassYield: {
      value: 97.6,
      unit: '%',
      changePct: '+0.8%',
      isPositive: true,
      trend: [96.8, 97.1, 97.2, 97.4, 97.6]
    },
    openDefects: {
      value: 18,
      unit: 'defects',
      changePct: '-4',
      isPositive: true,
      trend: [24, 22, 20, 19, 18]
    }
  });

  const [stages, setStages] = useState<StageStatus[]>([
    {
      id: 'stage-body',
      name: 'Body',
      lineCode: 'Line 01',
      stationCode: 'Station 04',
      status: 'Normal',
      targetHourly: 300,
      actualHourly: 298,
      efficiency: 99,
      stageType: 'body'
    },
    {
      id: 'stage-paint',
      name: 'Paint',
      lineCode: 'Line 02',
      stationCode: 'Station 02',
      status: 'Attention',
      targetHourly: 280,
      actualHourly: 266,
      efficiency: 95,
      stageType: 'paint'
    },
    {
      id: 'stage-assembly',
      name: 'Assembly',
      lineCode: 'Line 03',
      stationCode: 'Station 05',
      status: 'Normal',
      targetHourly: 320,
      actualHourly: 318,
      efficiency: 99,
      stageType: 'assembly'
    },
    {
      id: 'stage-qc',
      name: 'Final QC',
      lineCode: 'Line 04',
      stationCode: 'Station 01',
      status: 'Issue',
      targetHourly: 320,
      actualHourly: 287,
      efficiency: 96,
      stageType: 'qc'
    }
  ]);

  const [activities, setActivities] = useState<ActivityEvent[]>([
    {
      id: 'act-1',
      time: '16:46',
      title: 'Defect detected at Assembly 03',
      subtitle: 'Defect #D-1042',
      type: 'defect',
      severity: 'critical'
    },
    {
      id: 'act-2',
      time: '16:42',
      title: 'Rework completed at Paint 02',
      subtitle: 'Defect #D-1039',
      type: 'rework'
    },
    {
      id: 'act-3',
      time: '16:38',
      title: 'Line 01 running normally',
      subtitle: 'Speed: 298 uph',
      type: 'normal'
    },
    {
      id: 'act-4',
      time: '16:35',
      title: 'New defect logged',
      subtitle: 'Defect #D-1041',
      type: 'defect',
      severity: 'major'
    },
    {
      id: 'act-5',
      time: '16:30',
      title: 'Quality check passed',
      subtitle: 'Inspection Station 04',
      type: 'quality'
    }
  ]);

  const [defectRateHistory, setDefectRateHistory] = useState<HourlyDefectPoint[]>([
    { time: '08:00', rate: 2.1 },
    { time: '10:00', rate: 2.8 },
    { time: '12:00', rate: 2.3 },
    { time: '14:00', rate: 2.6 },
    { time: '16:00', rate: 2.4 }
  ]);

  // Core domain states
  const [lines, setLines] = useState<AssemblyLine[]>([]);
  const [stations, setStations] = useState<Workstation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [reworks, setReworks] = useState<ReworkOrder[]>([]);
  const [metrics, setMetrics] = useState<QualityMetricsSummary>({
    first_time_quality_pct: 97.6,
    total_inspections: 1248,
    passed_inspections: 1218,
    failed_inspections: 30,
    total_defects: 124,
    open_defects: 18,
    critical_defects: 2,
    defects_per_unit: 0.1,
    defects_per_million_opp: 2400,
    active_reworks: 5,
    average_rework_minutes: 32,
    total_copq_usd: 14500
  });
  const [paretoData, setParetoData] = useState<ParetoItem[]>([]);
  const [trendsData, setTrendsData] = useState<LineQualityTrend[]>([]);
  const [heatmapData, setHeatmapData] = useState<ZoneHeatmapItem[]>([]);

  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinModalCoords, setPinModalCoords] = useState<{ x: number; y: number; view: 'top' | 'side_left' | 'front' | 'rear'; zone: VehicleZone } | null>(null);
  const [selectedVehicleForPin, setSelectedVehicleForPin] = useState<Vehicle | undefined>(undefined);

  const [isReworkModalOpen, setIsReworkModalOpen] = useState<boolean>(false);
  const [activeDefectForRework, setActiveDefectForRework] = useState<Defect | null>(null);
  const [activeExistingRework, setActiveExistingRework] = useState<ReworkOrder | null>(null);

  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState<boolean>(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [
        fetchedSummary,
        fetchedStages,
        fetchedActivities,
        fetchedHistory,
        fetchedLines,
        fetchedStations,
        fetchedVehicles,
        fetchedDefects,
        fetchedReworks,
        fetchedKPIs,
        fetchedPareto,
        fetchedTrends,
        fetchedHeatmap
      ] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getStages().catch(() => null),
        api.getActivities().catch(() => null),
        api.getDefectRateHistory().catch(() => null),
        api.getLines().catch(() => null),
        api.getStations().catch(() => null),
        api.getVehicles().catch(() => null),
        api.getDefects().catch(() => null),
        api.getReworks().catch(() => null),
        api.getKPIs().catch(() => null),
        api.getPareto().catch(() => null),
        api.getTrends().catch(() => null),
        api.getHeatmap().catch(() => null)
      ]);

      if (fetchedSummary) setDashboardSummary(fetchedSummary);
      if (fetchedStages && fetchedStages.length > 0) setStages(fetchedStages);
      if (fetchedActivities && fetchedActivities.length > 0) setActivities(fetchedActivities);
      if (fetchedHistory && fetchedHistory.length > 0) setDefectRateHistory(fetchedHistory);

      if (fetchedLines) setLines(fetchedLines);
      if (fetchedStations) setStations(fetchedStations);
      if (fetchedVehicles) setVehicles(fetchedVehicles);
      if (fetchedDefects) setDefects(fetchedDefects);
      if (fetchedReworks) setReworks(fetchedReworks);
      if (fetchedKPIs) setMetrics(fetchedKPIs);
      if (fetchedPareto) setParetoData(fetchedPareto);
      if (fetchedTrends) setTrendsData(fetchedTrends);
      if (fetchedHeatmap) setHeatmapData(fetchedHeatmap);
    } catch (err) {
      console.error('Error fetching automotive telemetry data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Connect WebSocket
    socketClient.connect();

    // Setup real-time event listeners
    const unsubDefect = socketClient.on('DEFECT_LOGGED', (newDefect: Defect) => {
      setDefects(prev => [newDefect, ...prev.filter(d => d.id !== newDefect.id)]);
      // Update vehicle count
      setVehicles(prev => prev.map(v => {
        if (v.id === newDefect.vehicle_id || v.vin === newDefect.vin) {
          return {
            ...v,
            defect_count: v.defect_count + 1,
            status: newDefect.severity === 'CRITICAL' ? 'QUALITY_HOLD' : 'REWORK_REQUIRED'
          };
        }
        return v;
      }));
      // Refresh KPIs and summary in background
      api.getDashboardSummary().then(s => s && setDashboardSummary(s)).catch(() => {});
      api.getActivities().then(a => a && setActivities(a)).catch(() => {});
      api.getKPIs().then(k => k && setMetrics(k)).catch(() => {});
      api.getPareto().then(p => p && setParetoData(p)).catch(() => {});
      api.getHeatmap().then(h => h && setHeatmapData(h)).catch(() => {});
    });

    const unsubDefectUpdate = socketClient.on('DEFECT_UPDATED', (updatedDefect: Defect) => {
      setDefects(prev => prev.map(d => d.id === updatedDefect.id ? updatedDefect : d));
      api.getDashboardSummary().then(s => s && setDashboardSummary(s)).catch(() => {});
      api.getKPIs().then(k => k && setMetrics(k)).catch(() => {});
    });

    const unsubInsp = socketClient.on('INSPECTION_COMPLETED', (_newInsp: Inspection) => {
      api.getDashboardSummary().then(s => s && setDashboardSummary(s)).catch(() => {});
      api.getActivities().then(a => a && setActivities(a)).catch(() => {});
      api.getKPIs().then(k => k && setMetrics(k)).catch(() => {});
      api.getTrends().then(t => t && setTrendsData(t)).catch(() => {});
    });

    const unsubRework = socketClient.on('REWORK_UPDATED', (updatedRework: ReworkOrder) => {
      setReworks(prev => [updatedRework, ...prev.filter(r => r.id !== updatedRework.id)]);
      api.getDashboardSummary().then(s => s && setDashboardSummary(s)).catch(() => {});
      api.getActivities().then(a => a && setActivities(a)).catch(() => {});
      api.getKPIs().then(k => k && setMetrics(k)).catch(() => {});
      api.getDefects().then(d => d && setDefects(d)).catch(() => {});
    });

    const unsubLine = socketClient.on('LINE_STATUS_CHANGED', (updatedLine: AssemblyLine) => {
      setLines(prev => prev.map(l => l.id === updatedLine.id ? updatedLine : l));
      api.getStages().then(st => st && setStages(st)).catch(() => {});
    });

    return () => {
      unsubDefect();
      unsubDefectUpdate();
      unsubInsp();
      unsubRework();
      unsubLine();
    };
  }, [fetchData]);

  // Handlers
  const handleUpdateLineStatus = async (lineId: string, status: 'RUNNING' | 'SLOWED' | 'HALTED') => {
    try {
      const updated = await api.updateLineStatus(lineId, status);
      setLines(prev => prev.map(l => l.id === lineId ? updated : l));
      const freshStages = await api.getStages();
      if (freshStages) setStages(freshStages);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePinDefectClick = (coords: { x: number; y: number; view: 'top' | 'side_left' | 'front' | 'rear'; zone: VehicleZone }) => {
    setPinModalCoords(coords);
    setIsPinModalOpen(true);
  };

  const handleSelectDefect = (defect: Defect) => {
    const existing = reworks.find(r => r.defect_id === defect.id);
    setActiveDefectForRework(defect);
    setActiveExistingRework(existing || null);
    setIsReworkModalOpen(true);
  };

  const handleSubmitNewDefect = async (defectPayload: any) => {
    await api.createDefect(defectPayload);
    await fetchData();
  };

  const handleUpdateDefectStatus = async (defectId: string, status: DefectStatus) => {
    const updated = await api.updateDefect(defectId, { status });
    setDefects(prev => prev.map(d => d.id === defectId ? updated : d));
  };

  const handleSubmitInspection = async (inspectionData: any) => {
    await api.recordInspection(inspectionData);
    await fetchData();
  };

  const handleOpenReworkModal = (defect: Defect, rework?: ReworkOrder) => {
    setActiveDefectForRework(defect);
    setActiveExistingRework(rework || reworks.find(r => r.defect_id === defect.id) || null);
    setIsReworkModalOpen(true);
  };

  const handleSubmitRework = async (reworkData: any) => {
    if (activeExistingRework) {
      await api.updateRework(activeExistingRework.id, reworkData);
    } else {
      await api.createRework(reworkData);
    }
    await fetchData();
  };

  const handleVerifyRework = async (reworkId: string, status: 'VERIFIED_PASS' | 'FAILED_RE_REWORK', verifier: string) => {
    await api.updateRework(reworkId, { verification_status: status, verifier_name: verifier });
    await fetchData();
  };

  const handleLaunchVehicle = async (vehicleData: any) => {
    const newVeh = await api.createVehicle(vehicleData);
    setVehicles(prev => [newVeh, ...prev]);
    const freshSummary = await api.getDashboardSummary();
    if (freshSummary) setDashboardSummary(freshSummary);
  };

  const handleTriggerDefectPinFromStation = (vehicle: Vehicle, _station: Workstation) => {
    setSelectedVehicleForPin(vehicle);
    setPinModalCoords({ x: 45, y: 50, view: 'top', zone: 'HOOD' });
    setIsPinModalOpen(true);
  };

  const handleSelectDefectForBlueprint = (defect: Defect) => {
    const veh = vehicles.find(v => v.vin === defect.vin || v.id === defect.vehicle_id);
    if (veh) setSelectedVehicleForPin(veh);
    setActiveTab('live-monitoring');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('autoqc_user');
    localStorage.removeItem('autoqc_token');
    sessionStorage.removeItem('autoqc_user');
    sessionStorage.removeItem('autoqc_token');
    setCurrentUser(null);
  };

  const openDefectsCount = defects.filter(d => d.status !== 'CLOSED' && d.status !== 'VERIFIED').length || 18;
  const activeReworkCount = reworks.filter(r => r.verification_status === 'PENDING').length || 5;

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F9FE] text-[#18345F] flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        currentShift={currentShift}
        onShiftChange={setCurrentShift}
        onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
      />


      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab: ActiveTab) => setActiveTab(tab)}
          openDefectsCount={openDefectsCount}
          activeReworkCount={activeReworkCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1700px] mx-auto w-full">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3 font-sans text-[#1685F8]">
              <div className="w-9 h-9 rounded-full border-3 border-[#1685F8] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-[#64748B]">Connecting to AutoQC Telemetry...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Control Dashboard (matches reference image) */}
              {activeTab === 'dashboard' && (
                <DashboardPage
                  summary={dashboardSummary}
                  stages={stages}
                  activities={activities}
                  defectRateHistory={defectRateHistory}
                  defects={defects}
                  onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
                  onSelectDefect={handleSelectDefect}
                  onStageClick={() => setActiveTab('lines')}
                />
              )}

              {/* Tab 2: Live Line Monitoring */}
              {activeTab === 'live-monitoring' && (
                <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
                        Live Line Monitoring & Spatial Blueprint
                      </h1>
                      <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
                        Real-time plant station throughput pacing, stage bottlenecks, and 3D vehicle defect localization
                      </p>
                    </div>
                  </div>

                  {/* 4 Stages Status */}
                  <LiveAssemblyLineStatus
                    stages={stages}
                    onViewAll={() => setActiveTab('lines')}
                    onStageClick={() => setActiveTab('lines')}
                  />

                  {/* Vehicle Blueprint Interactive Pinning */}
                  <VehicleBlueprintPage
                    vehicles={vehicles}
                    defects={defects}
                    lines={lines}
                    stations={stations}
                    onPinDefectClick={handlePinDefectClick}
                    onSelectDefect={handleSelectDefect}
                    onOpenReworkModal={handleOpenReworkModal}
                  />
                </div>
              )}

              {/* Tab 3: Digital Inspection */}
              {activeTab === 'inspection' && (
                <InspectionStationPage
                  stations={stations}
                  lines={lines}
                  vehicles={vehicles}
                  currentShift={currentShift}
                  onSubmitInspection={handleSubmitInspection}
                  onTriggerDefectPin={handleTriggerDefectPinFromStation}
                />
              )}

              {/* Tab 4: Defect Registry */}
              {activeTab === 'defects' && (
                <DefectRegistryPage
                  defects={defects}
                  lines={lines}
                  stations={stations}
                  onOpenReworkModal={handleOpenReworkModal}
                  onUpdateDefectStatus={handleUpdateDefectStatus}
                  onSelectDefectForBlueprint={handleSelectDefectForBlueprint}
                />
              )}

              {/* Tab 5: Rework & Root Cause */}
              {activeTab === 'rework' && (
                <ReworkBayPage
                  reworks={reworks}
                  defects={defects}
                  onOpenReworkModal={handleOpenReworkModal}
                  onVerifyRework={handleVerifyRework}
                />
              )}

              {/* Tab 6: Quality Analytics */}
              {activeTab === 'analytics' && (
                <AnalyticsPage
                  metrics={metrics}
                  paretoData={paretoData}
                  trendsData={trendsData}
                  heatmapData={heatmapData}
                />
              )}

              {/* Tab 7: Assembly Lines */}
              {activeTab === 'lines' && (
                <AssemblyLinesPage
                  lines={lines}
                  stations={stations}
                  vehicles={vehicles}
                  onUpdateLineStatus={handleUpdateLineStatus}
                />
              )}

              {/* Tab 8: Reports & Settings */}
              {activeTab === 'settings' && (
                <ReportsSettingsPage
                  metrics={metrics}
                  onRefreshData={fetchData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Defect Pinning Modal */}
      <DefectPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSubmit={handleSubmitNewDefect}
        vehicles={vehicles}
        lines={lines}
        stations={stations}
        initialCoords={pinModalCoords}
        selectedVehicle={selectedVehicleForPin}
        currentShift={currentShift}
      />

      {/* Rework RCA Modal */}
      {activeDefectForRework && (
        <ReworkModal
          isOpen={isReworkModalOpen}
          onClose={() => {
            setIsReworkModalOpen(false);
            setActiveDefectForRework(null);
            setActiveExistingRework(null);
          }}
          defect={activeDefectForRework}
          existingRework={activeExistingRework}
          onSubmit={handleSubmitRework}
          onVerify={handleVerifyRework}
        />
      )}

      {/* Launch New VIN Modal */}
      <NewVehicleModal
        isOpen={isNewVehicleModalOpen}
        onClose={() => setIsNewVehicleModalOpen(false)}
        onSubmit={handleLaunchVehicle}
        lines={lines}
        stations={stations}
      />
    </div>
  );
}

export default App;
