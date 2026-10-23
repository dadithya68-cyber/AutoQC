export type ShiftType = 'Shift A (Morning)' | 'Shift B (Evening)' | 'Shift C (Night)';

export type DefectSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type DefectStatus = 'LOGGED' | 'IN_REVIEW' | 'ASSIGNED_REWORK' | 'REWORK_COMPLETED' | 'VERIFIED' | 'CLOSED';

export type InspectionStatus = 'PASSED' | 'FAILED' | 'CONDITIONAL_PASS';

export type VehicleStatus = 'IN_PRODUCTION' | 'QUALITY_HOLD' | 'REWORK_REQUIRED' | 'PASSED_QA' | 'SCRAPPED';

export type VehicleZone = 'HOOD' | 'ROOF' | 'TRUNK' | 'DOOR_FL' | 'DOOR_FR' | 'DOOR_RL' | 'DOOR_RR' | 'BUMPER_FRONT' | 'BUMPER_REAR' | 'WINDSHIELD' | 'UNDERBODY' | 'BATTERY_PACK' | 'CABIN_INTERIOR' | 'POWERTRAIN';

export interface AssemblyLine {
  id: string;
  name: string;
  code: string;
  description: string;
  target_hourly_rate: number;
  current_status: 'RUNNING' | 'SLOWED' | 'HALTED';
}

export interface Workstation {
  id: string;
  line_id: string;
  name: string;
  code: string;
  sequence_order: number;
  type: 'WELD' | 'PAINT' | 'POWERTRAIN' | 'ELECTRICAL' | 'FINAL_INSPECTION' | 'DYNAMIC_TEST';
  checklist_template: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  code: string;
  label: string;
  standard_spec: string;
  tolerance: string;
  type: 'BOOLEAN' | 'MEASUREMENT' | 'VISUAL';
  required: boolean;
}

export interface Vehicle {
  id: string;
  vin: string;
  model: string;
  trim_level: string;
  color: string;
  current_line_id: string;
  current_station_id: string;
  status: VehicleStatus;
  manufactured_date: string;
  defect_count: number;
}

export interface DefectCoordinates {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  view: 'top' | 'side_left' | 'side_right' | 'front' | 'rear';
  zone: VehicleZone;
}

export interface Defect {
  id: string;
  vin: string;
  vehicle_id: string;
  inspection_id?: string;
  line_id: string;
  line_name?: string;
  station_id: string;
  station_name?: string;
  component: string;
  category: 'PAINT' | 'BODY_WELD' | 'DIMENSIONAL' | 'ELECTRICAL' | 'MECHANICAL' | 'TORQUE' | 'SURFACE_SCRATCH' | 'ALIGNMENT';
  severity: DefectSeverity;
  description: string;
  coordinates: DefectCoordinates;
  status: DefectStatus;
  logged_by: string;
  shift: ShiftType;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  rework_ticket_id?: string;
}

export interface InspectionChecklistResult {
  checklist_id: string;
  label: string;
  status: 'PASS' | 'FAIL';
  actual_value?: string;
  notes?: string;
}

export interface Inspection {
  id: string;
  vehicle_id: string;
  vin: string;
  station_id: string;
  station_name?: string;
  line_id: string;
  line_name?: string;
  inspector_name: string;
  shift: ShiftType;
  status: InspectionStatus;
  notes?: string;
  checklist_results: InspectionChecklistResult[];
  defects_found: number;
  duration_seconds: number;
  created_at: string;
}

export interface ReworkOrder {
  id: string;
  defect_id: string;
  vin: string;
  vehicle_id: string;
  technician_name: string;
  root_cause_category: 'MAN' | 'MACHINE' | 'METHOD' | 'MATERIAL' | 'MEASUREMENT' | 'ENVIRONMENT'; // Ishikawa 6M
  root_cause_analysis: string;
  corrective_action: string;
  parts_replaced: string[];
  labor_minutes: number;
  cost_copq: number; // Cost of Poor Quality in USD
  verification_status: 'PENDING' | 'VERIFIED_PASS' | 'FAILED_RE_REWORK';
  verifier_name?: string;
  started_at: string;
  completed_at?: string;
  notes?: string;
}

export interface QualityMetricsSummary {
  first_time_quality_pct: number;
  total_inspections: number;
  passed_inspections: number;
  failed_inspections: number;
  total_defects: number;
  open_defects: number;
  critical_defects: number;
  defects_per_unit: number; // DPU
  defects_per_million_opp: number; // DPMO
  active_reworks: number;
  average_rework_minutes: number;
  total_copq_usd: number;
}

export interface ParetoItem {
  category: string;
  count: number;
  percentage: number;
  cumulative_percentage: number;
}

export interface LineQualityTrend {
  time_bucket: string;
  inspections_count: number;
  defects_count: number;
  ftq_rate: number;
  dpu: number;
}

export interface ZoneHeatmapItem {
  zone: VehicleZone;
  label: string;
  defect_count: number;
  critical_count: number;
}
