import { AssemblyLine, Workstation, Vehicle, Defect, Inspection, ReworkOrder } from '../types/index.js';

export const initialLines: AssemblyLine[] = [
  {
    id: 'line-biw',
    name: 'Body Shop (BIW)',
    code: 'Line 01',
    description: 'Robotic framing, laser brazing, and structural spot welding',
    target_hourly_rate: 300,
    current_status: 'RUNNING'
  },
  {
    id: 'line-paint',
    name: 'Paint & Coating',
    code: 'Line 02',
    description: 'Cathodic E-coat, primer, basecoat, and automated clearcoat',
    target_hourly_rate: 280,
    current_status: 'SLOWED'
  },
  {
    id: 'line-assembly',
    name: 'General Assembly',
    code: 'Line 03',
    description: 'Interior cockpit, wiring harness, powertrain, and battery integration',
    target_hourly_rate: 320,
    current_status: 'RUNNING'
  },
  {
    id: 'line-qc',
    name: 'Final QC & EOL Testing',
    code: 'Line 04',
    description: 'Optical inspection tunnel, ADAS alignment, dyno roll test, and water chamber',
    target_hourly_rate: 320,
    current_status: 'HALTED'
  }
];

export const initialStations: Workstation[] = [
  {
    id: 'station-1',
    line_id: 'line-biw',
    name: 'Station 1 - Body Framing',
    code: 'Station 1',
    sequence_order: 1,
    type: 'WELD',
    checklist_template: [
      { id: 'chk-wld-1', code: 'WLD-01', label: 'B-Pillar structural laser weld continuity', standard_spec: 'Continuous weld seam, zero porosity', tolerance: '±0.2mm', type: 'VISUAL', required: true },
      { id: 'chk-wld-2', code: 'WLD-02', label: 'Subframe resistance spot weld shear strength', standard_spec: '>= 4.5 kN pull resistance', tolerance: 'Min 4.2 kN', type: 'MEASUREMENT', required: true },
      { id: 'chk-wld-3', code: 'WLD-03', label: 'Front shock tower dimensional coordinates', standard_spec: 'X: 1250mm, Y: 840mm, Z: 512mm', tolerance: '±0.8mm', type: 'MEASUREMENT', required: true }
    ]
  },
  {
    id: 'station-2',
    line_id: 'line-paint',
    name: 'Station 2 - Paint Booth',
    code: 'Station 2',
    sequence_order: 2,
    type: 'PAINT',
    checklist_template: [
      { id: 'chk-pnt-1', code: 'PNT-01', label: 'Cathodic dip E-coat film thickness', standard_spec: '22 µm dry film', tolerance: '20-25 µm', type: 'MEASUREMENT', required: true },
      { id: 'chk-clr-1', code: 'CLR-01', label: 'Horizontal surface orange-peel DOI', standard_spec: 'DOI rating >= 92', tolerance: 'Min 90', type: 'MEASUREMENT', required: true },
      { id: 'chk-clr-2', code: 'CLR-02', label: 'Surface finish dust inclusions check', standard_spec: '0 visible defects on class-A surfaces', tolerance: '0 allowed', type: 'VISUAL', required: true }
    ]
  },
  {
    id: 'station-3',
    line_id: 'line-assembly',
    name: 'Station 3 - Assembly Fitment',
    code: 'Station 3',
    sequence_order: 3,
    type: 'POWERTRAIN',
    checklist_template: [
      { id: 'chk-gap-1', code: 'GAP-01', label: 'Front fender to driver door gap uniformity', standard_spec: '3.5 mm nominal', tolerance: '±0.5 mm', type: 'MEASUREMENT', required: true },
      { id: 'chk-bat-1', code: 'BAT-01', label: 'High-voltage enclosure IP69K helium leak test', standard_spec: '< 1.0 x 10^-4 mbar*l/s', tolerance: 'Pass/Fail', type: 'BOOLEAN', required: true },
      { id: 'chk-bat-2', code: 'BAT-02', label: 'M10 Structural chassis bolt torque', standard_spec: '65.0 Nm torque + 45 deg angle', tolerance: '62-68 Nm', type: 'MEASUREMENT', required: true }
    ]
  },
  {
    id: 'station-4',
    line_id: 'line-qc',
    name: 'Station 4 - Final Inspection',
    code: 'Station 4',
    sequence_order: 4,
    type: 'FINAL_INSPECTION',
    checklist_template: [
      { id: 'chk-ads-1', code: 'ADS-01', label: 'Forward windshield camera pitch/yaw alignment', standard_spec: 'Pitch: 0.0°, Yaw: 0.0°', tolerance: '±0.15°', type: 'MEASUREMENT', required: true },
      { id: 'chk-dyn-1', code: 'DYN-01', label: 'Four-wheel regenerative brake force distribution', standard_spec: 'Imbalance < 8% between left/right axle', tolerance: 'Max 10%', type: 'MEASUREMENT', required: true },
      { id: 'chk-dyn-2', code: 'DYN-02', label: 'High-pressure monsoonal water ingress chamber test', standard_spec: 'Zero moisture detection across cabin/trunk', tolerance: '0 drops', type: 'BOOLEAN', required: true }
    ]
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-001',
    vin: '1G6AL5SX8M0100912',
    model: 'Apex-EV GT Performance',
    trim_level: 'Dual Motor AWD',
    color: 'Stardust Silver Metallic',
    current_line_id: 'line-qc',
    current_station_id: 'station-4',
    status: 'QUALITY_HOLD',
    manufactured_date: new Date(Date.now() - 3600000 * 3).toISOString(),
    defect_count: 2
  },
  {
    id: 'veh-002',
    vin: 'JTJHY7AX6N0204819',
    model: 'Titan Pro e-SUV',
    trim_level: 'Executive Ultra',
    color: 'Obsidian Midnight Black',
    current_line_id: 'line-paint',
    current_station_id: 'station-2',
    status: 'REWORK_REQUIRED',
    manufactured_date: new Date(Date.now() - 3600000 * 4).toISOString(),
    defect_count: 2
  },
  {
    id: 'veh-003',
    vin: 'WAUZZZF27N1058291',
    model: 'Aero Compact EV',
    trim_level: 'Long Range Plus',
    color: 'Glacier Polar White',
    current_line_id: 'line-assembly',
    current_station_id: 'station-3',
    status: 'IN_PRODUCTION',
    manufactured_date: new Date(Date.now() - 3600000 * 6).toISOString(),
    defect_count: 1
  },
  {
    id: 'veh-004',
    vin: 'KM8K23AA4NU382910',
    model: 'Apex-EV GT Performance',
    trim_level: 'Standard Urban',
    color: 'Pulse Crimson Red',
    current_line_id: 'line-qc',
    current_station_id: 'station-4',
    status: 'PASSED_QA',
    manufactured_date: new Date(Date.now() - 3600000 * 8).toISOString(),
    defect_count: 0
  }
];

// Exact defects from reference photo
export const initialDefects: Defect[] = [
  {
    id: 'D-1042',
    vin: '1G6AL5SX8M0100912',
    vehicle_id: 'veh-001',
    line_id: 'line-assembly',
    line_name: 'General Assembly',
    station_id: 'station-3',
    station_name: 'Assembly 03',
    component: 'Driver Door Outer Panel',
    category: 'DIMENSIONAL',
    severity: 'CRITICAL', // High
    description: 'Panel misalignment on front fender to driver door seam.',
    coordinates: { x: 38, y: 35, view: 'side_left', zone: 'DOOR_FL' },
    status: 'IN_REVIEW',
    logged_by: 'Inspector David Rossi',
    shift: 'Shift A (Morning)',
    created_at: new Date(Date.now() - 60000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 60000 * 14).toISOString()
  },
  {
    id: 'D-1041',
    vin: 'JTJHY7AX6N0204819',
    vehicle_id: 'veh-002',
    line_id: 'line-paint',
    line_name: 'Paint & Coating',
    station_id: 'station-2',
    station_name: 'Paint 02',
    component: 'Rear Quarter Panel',
    category: 'PAINT',
    severity: 'MAJOR', // Medium
    description: 'Surface scratch on lower edge near charging port flap.',
    coordinates: { x: 76, y: 40, view: 'side_left', zone: 'DOOR_RL' },
    status: 'ASSIGNED_REWORK',
    logged_by: 'Inspector Sarah Chen',
    shift: 'Shift A (Morning)',
    rework_ticket_id: 'rwk-501',
    created_at: new Date(Date.now() - 60000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 60000 * 5).toISOString()
  },
  {
    id: 'D-1040',
    vin: '1G6AL5SX8M0100912',
    vehicle_id: 'veh-001',
    line_id: 'line-qc',
    line_name: 'Final QC & EOL Testing',
    station_id: 'station-4',
    station_name: 'QC 01',
    component: 'Main Harness Junction',
    category: 'ELECTRICAL',
    severity: 'CRITICAL', // High
    description: 'Loose connector pin on high-voltage CAN bus transceiver.',
    coordinates: { x: 50, y: 55, view: 'top', zone: 'CABIN_INTERIOR' },
    status: 'LOGGED', // Assigned
    logged_by: 'Inspector Adithya',
    shift: 'Shift A (Morning)',
    created_at: new Date(Date.now() - 60000 * 25).toISOString(),
    updated_at: new Date(Date.now() - 60000 * 25).toISOString()
  },
  {
    id: 'D-1039',
    vin: 'WAUZZZF27N1058291',
    vehicle_id: 'veh-003',
    line_id: 'line-assembly',
    line_name: 'General Assembly',
    station_id: 'station-3',
    station_name: 'Assembly 02',
    component: 'Battery Cradle Bracket',
    category: 'TORQUE',
    severity: 'MINOR', // Low
    description: 'Missing bolt on subframe aerodynamic undertray retention bracket.',
    coordinates: { x: 52, y: 70, view: 'top', zone: 'UNDERBODY' },
    status: 'CLOSED',
    logged_by: 'Tech Kenji Sato',
    shift: 'Shift A (Morning)',
    created_at: new Date(Date.now() - 60000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 60000 * 20).toISOString()
  },
  {
    id: 'D-1038',
    vin: 'JTJHY7AX6N0204819',
    vehicle_id: 'veh-002',
    line_id: 'line-paint',
    line_name: 'Paint & Coating',
    station_id: 'station-2',
    station_name: 'Paint 01',
    component: 'Hood Outer Crown',
    category: 'PAINT',
    severity: 'MAJOR', // Medium
    description: 'Paint bubble and solvent pop micro-blister (8mm) on hood center ridge.',
    coordinates: { x: 25, y: 45, view: 'top', zone: 'HOOD' },
    status: 'ASSIGNED_REWORK',
    logged_by: 'Inspector Sarah Chen',
    shift: 'Shift A (Morning)',
    rework_ticket_id: 'rwk-502',
    created_at: new Date(Date.now() - 60000 * 35).toISOString(),
    updated_at: new Date(Date.now() - 60000 * 10).toISOString()
  }
];

export const initialReworks: ReworkOrder[] = [
  {
    id: 'rwk-501',
    defect_id: 'D-1041',
    vin: 'JTJHY7AX6N0204819',
    vehicle_id: 'veh-002',
    technician_name: 'Lead Tech Amanda Bradley',
    root_cause_category: 'METHOD',
    root_cause_analysis: 'Handling contact during body transfer fixture clamp engagement.',
    corrective_action: 'Buffed with 3M compound, polished surface, and adjusted transfer arm clearance buffer pads.',
    parts_replaced: ['Clearcoat buff pad'],
    labor_minutes: 25,
    cost_copq: 6250,
    verification_status: 'VERIFIED_PASS',
    verifier_name: 'QA Supervisor Tom Harrison',
    started_at: new Date(Date.now() - 60000 * 20).toISOString(),
    completed_at: new Date(Date.now() - 60000 * 5).toISOString()
  },
  {
    id: 'rwk-502',
    defect_id: 'D-1038',
    vin: 'JTJHY7AX6N0204819',
    vehicle_id: 'veh-002',
    technician_name: 'Tech Kenji Sato',
    root_cause_category: 'MACHINE',
    root_cause_analysis: 'Spray atomizing bell nozzle tip micro-clogged causing droplet condensation.',
    corrective_action: 'Spot wet-sand 2000-grit, 3-stage polishing, and ultrasonic nozzle flush.',
    parts_replaced: ['Atomizer tip nozzle'],
    labor_minutes: 35,
    cost_copq: 11650,
    verification_status: 'PENDING',
    started_at: new Date(Date.now() - 60000 * 10).toISOString()
  }
];

export const initialInspections: Inspection[] = [
  {
    id: 'insp-101',
    vehicle_id: 'veh-004',
    vin: 'KM8K23AA4NU382910',
    station_id: 'station-4',
    station_name: 'Station 4 - Final Inspection',
    line_id: 'line-qc',
    line_name: 'Final QC & EOL Testing',
    inspector_name: 'Inspector Elena Rostova',
    shift: 'Shift A (Morning)',
    status: 'PASSED',
    notes: 'Unit #A732 Golden standard. 0 discrepancies noted.',
    checklist_results: [
      { checklist_id: 'chk-ads-1', label: 'Forward camera pitch/yaw alignment', status: 'PASS', actual_value: '0.02°' },
      { checklist_id: 'chk-dyn-1', label: 'Regenerative brake force balance', status: 'PASS', actual_value: '1.8%' },
      { checklist_id: 'chk-dyn-2', label: 'Monsoonal water ingress chamber test', status: 'PASS', actual_value: '0 drops' }
    ],
    defects_found: 0,
    duration_seconds: 180,
    created_at: new Date(Date.now() - 60000 * 18).toISOString()
  }
];

// Activity Feed matching reference photo
export const initialActivityEvents = [
  {
    id: 'act-1',
    time: '16:46',
    title: 'Defect detected at Assembly 03',
    subtitle: 'Panel misalignment (D-1042)',
    type: 'defect' as const,
    severity: 'critical' as const,
    stationId: 'Assembly 03',
    defectId: 'D-1042',
    timestamp: new Date().toISOString()
  },
  {
    id: 'act-2',
    time: '16:42',
    title: 'Rework completed at Paint 02',
    subtitle: 'Surface scratch (D-1041)',
    type: 'rework' as const,
    severity: 'info' as const,
    stationId: 'Paint 02',
    defectId: 'D-1041',
    timestamp: new Date().toISOString()
  },
  {
    id: 'act-3',
    time: '16:38',
    title: 'Line 01 running normally',
    subtitle: 'Production rate 298/hr',
    type: 'normal' as const,
    severity: 'info' as const,
    stationId: 'Line 01',
    timestamp: new Date().toISOString()
  },
  {
    id: 'act-4',
    time: '16:35',
    title: 'New defect logged',
    subtitle: 'Loose connector (D-1040)',
    type: 'defect' as const,
    severity: 'major' as const,
    stationId: 'QC 01',
    defectId: 'D-1040',
    timestamp: new Date().toISOString()
  },
  {
    id: 'act-5',
    time: '16:30',
    title: 'Quality check passed',
    subtitle: 'Final QC - Unit #A732',
    type: 'quality' as const,
    severity: 'info' as const,
    stationId: 'Final QC',
    timestamp: new Date().toISOString()
  }
];

// Stages matching reference photo
export const initialStageStatuses = [
  {
    id: 'stage-body',
    name: 'Body',
    lineCode: 'Line 01',
    stationCode: 'Station 1',
    status: 'Normal' as const,
    targetHourly: 300,
    actualHourly: 298,
    efficiency: 99,
    stageType: 'body' as const
  },
  {
    id: 'stage-paint',
    name: 'Paint',
    lineCode: 'Line 02',
    stationCode: 'Station 2',
    status: 'Attention' as const,
    targetHourly: 280,
    actualHourly: 266,
    efficiency: 95,
    stageType: 'paint' as const
  },
  {
    id: 'stage-assembly',
    name: 'Assembly',
    lineCode: 'Line 03',
    stationCode: 'Station 3',
    status: 'Normal' as const,
    targetHourly: 320,
    actualHourly: 318,
    efficiency: 99,
    stageType: 'assembly' as const
  },
  {
    id: 'stage-qc',
    name: 'Final QC',
    lineCode: 'Line 04',
    stationCode: 'Station 4',
    status: 'Issue' as const,
    targetHourly: 320,
    actualHourly: 287,
    efficiency: 96,
    stageType: 'qc' as const
  }
];

export const initialDashboardSummary = {
  totalProduction: {
    value: 1248,
    unit: 'units',
    changePct: '+6.8%',
    isPositive: true,
    trend: [1180, 1195, 1210, 1205, 1224, 1238, 1248]
  },
  defectRate: {
    value: 2.4,
    unit: '%',
    changePct: '-1.2%',
    isPositive: true,
    trend: [3.8, 3.5, 3.2, 3.4, 2.9, 2.7, 2.4]
  },
  firstPassYield: {
    value: 97.6,
    unit: '%',
    changePct: '+1.3%',
    isPositive: true,
    trend: [96.1, 96.4, 96.8, 97.0, 97.2, 97.5, 97.6]
  },
  openDefects: {
    value: 18,
    unit: '',
    changePct: '-28.0%',
    isPositive: true,
    trend: [26, 24, 22, 23, 20, 19, 18]
  }
};
