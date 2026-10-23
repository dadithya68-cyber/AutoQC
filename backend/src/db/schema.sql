-- Automotive Assembly Quality Assurance & Defect Telemetry Database Schema

CREATE TABLE IF NOT EXISTS assembly_lines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    target_hourly_rate INTEGER DEFAULT 30,
    current_status VARCHAR(20) DEFAULT 'RUNNING' CHECK (current_status IN ('RUNNING', 'SLOWED', 'HALTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workstations (
    id VARCHAR(50) PRIMARY KEY,
    line_id VARCHAR(50) REFERENCES assembly_lines(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    sequence_order INTEGER NOT NULL,
    type VARCHAR(30) NOT NULL,
    checklist_template JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    vin VARCHAR(17) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    trim_level VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    current_line_id VARCHAR(50) REFERENCES assembly_lines(id),
    current_station_id VARCHAR(50) REFERENCES workstations(id),
    status VARCHAR(30) DEFAULT 'IN_PRODUCTION' CHECK (status IN ('IN_PRODUCTION', 'QUALITY_HOLD', 'REWORK_REQUIRED', 'PASSED_QA', 'SCRAPPED')),
    manufactured_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    defect_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inspections (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    vin VARCHAR(17) NOT NULL,
    station_id VARCHAR(50) REFERENCES workstations(id),
    inspector_name VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PASSED', 'FAILED', 'CONDITIONAL_PASS')),
    notes TEXT,
    checklist_results JSONB DEFAULT '[]'::jsonb,
    defects_found INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS defects (
    id VARCHAR(50) PRIMARY KEY,
    vin VARCHAR(17) NOT NULL,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    inspection_id VARCHAR(50) REFERENCES inspections(id) ON DELETE SET NULL,
    line_id VARCHAR(50) REFERENCES assembly_lines(id),
    station_id VARCHAR(50) REFERENCES workstations(id),
    component VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR')),
    description TEXT NOT NULL,
    coordinates JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'LOGGED' CHECK (status IN ('LOGGED', 'IN_REVIEW', 'ASSIGNED_REWORK', 'REWORK_COMPLETED', 'VERIFIED', 'CLOSED')),
    logged_by VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    photo_url TEXT,
    rework_ticket_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rework_orders (
    id VARCHAR(50) PRIMARY KEY,
    defect_id VARCHAR(50) UNIQUE REFERENCES defects(id) ON DELETE CASCADE,
    vin VARCHAR(17) NOT NULL,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    technician_name VARCHAR(100) NOT NULL,
    root_cause_category VARCHAR(30) NOT NULL CHECK (root_cause_category IN ('MAN', 'MACHINE', 'METHOD', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT')),
    root_cause_analysis TEXT NOT NULL,
    corrective_action TEXT NOT NULL,
    parts_replaced JSONB DEFAULT '[]'::jsonb,
    labor_minutes INTEGER DEFAULT 30,
    cost_copq NUMERIC(10, 2) DEFAULT 0.00,
    verification_status VARCHAR(30) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED_PASS', 'FAILED_RE_REWORK')),
    verifier_name VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_defects_status ON defects(status);
CREATE INDEX IF NOT EXISTS idx_defects_severity ON defects(severity);
CREATE INDEX IF NOT EXISTS idx_defects_line ON defects(line_id);
CREATE INDEX IF NOT EXISTS idx_defects_created ON defects(created_at);
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rework_defect ON rework_orders(defect_id);
