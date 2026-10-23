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
  DashboardSummary,
  StageStatus,
  ActivityEvent,
  HourlyDefectPoint,
  DatabaseStatus,
  User,
  AuthResponse
} from '../types';


const API_BASE = '/api';

export const api = {
  // System Health & Database
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getDatabaseStatus(): Promise<DatabaseStatus> {
    const res = await fetch(`${API_BASE}/database/status`);
    const data = await res.json();
    return data.data;
  },

  // Dashboard Specific API
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    const data = await res.json();
    return data.data;
  },

  async getStages(): Promise<StageStatus[]> {
    const res = await fetch(`${API_BASE}/dashboard/stages`);
    const data = await res.json();
    return data.data;
  },

  async getActivities(): Promise<ActivityEvent[]> {
    const res = await fetch(`${API_BASE}/dashboard/activity`);
    const data = await res.json();
    return data.data;
  },

  async getDefectRateHistory(): Promise<HourlyDefectPoint[]> {
    const res = await fetch(`${API_BASE}/analytics/defect-rate-history`);
    const data = await res.json();
    return data.data;
  },

  // Lines & Stations
  async getLines(): Promise<AssemblyLine[]> {
    const res = await fetch(`${API_BASE}/lines`);
    const data = await res.json();
    return data.data;
  },

  async updateLineStatus(lineId: string, status: 'RUNNING' | 'SLOWED' | 'HALTED'): Promise<AssemblyLine> {
    const res = await fetch(`${API_BASE}/lines/${lineId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return data.data;
  },

  async getStations(lineId?: string): Promise<Workstation[]> {
    const url = lineId ? `${API_BASE}/stations?lineId=${lineId}` : `${API_BASE}/stations`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data;
  },

  // Vehicles
  async getVehicles(status?: string, lineId?: string): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (lineId) params.append('lineId', lineId);
    const res = await fetch(`${API_BASE}/vehicles?${params.toString()}`);
    const data = await res.json();
    return data.data;
  },

  async getVehicleByVin(vin: string): Promise<Vehicle> {
    const res = await fetch(`${API_BASE}/vehicles/${vin}`);
    const data = await res.json();
    return data.data;
  },

  async createVehicle(payload: Omit<Vehicle, 'id' | 'defect_count' | 'manufactured_date'>): Promise<Vehicle> {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.data;
  },

  // Defects
  async getDefects(filters?: { lineId?: string; stationId?: string; severity?: string; status?: string; vin?: string; category?: string }): Promise<Defect[]> {
    const params = new URLSearchParams();
    if (filters?.lineId) params.append('lineId', filters.lineId);
    if (filters?.stationId) params.append('stationId', filters.stationId);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.vin) params.append('vin', filters.vin);
    if (filters?.category) params.append('category', filters.category);

    const res = await fetch(`${API_BASE}/defects?${params.toString()}`);
    const data = await res.json();
    return data.data;
  },

  async createDefect(payload: Omit<Defect, 'id' | 'created_at' | 'updated_at'>): Promise<Defect> {
    const res = await fetch(`${API_BASE}/defects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.data;
  },

  async updateDefect(id: string, updates: Partial<Defect>): Promise<Defect> {
    const res = await fetch(`${API_BASE}/defects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.data;
  },

  // Inspections
  async getInspections(limit = 50): Promise<Inspection[]> {
    const res = await fetch(`${API_BASE}/inspections?limit=${limit}`);
    const data = await res.json();
    return data.data;
  },

  async recordInspection(payload: Omit<Inspection, 'id' | 'created_at'>): Promise<Inspection> {
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.data;
  },

  // Reworks
  async getReworks(status?: string): Promise<ReworkOrder[]> {
    const url = status ? `${API_BASE}/reworks?status=${status}` : `${API_BASE}/reworks`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data;
  },

  async createRework(payload: Omit<ReworkOrder, 'id' | 'started_at'>): Promise<ReworkOrder> {
    const res = await fetch(`${API_BASE}/reworks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.data;
  },

  async updateRework(id: string, updates: Partial<ReworkOrder>): Promise<ReworkOrder> {
    const res = await fetch(`${API_BASE}/reworks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.data;
  },

  // Analytics
  async getKPIs(): Promise<QualityMetricsSummary> {
    const res = await fetch(`${API_BASE}/analytics/kpis`);
    const data = await res.json();
    return data.data;
  },

  async getPareto(): Promise<ParetoItem[]> {
    const res = await fetch(`${API_BASE}/analytics/pareto`);
    const data = await res.json();
    return data.data;
  },

  async getTrends(): Promise<LineQualityTrend[]> {
    const res = await fetch(`${API_BASE}/analytics/trends`);
    const data = await res.json();
    return data.data;
  },

  async getHeatmap(): Promise<ZoneHeatmapItem[]> {
    const res = await fetch(`${API_BASE}/analytics/heatmap`);
    const data = await res.json();
    return data.data;
  },

  // Authentication
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Invalid username or password.');
    }
    return data.data;
  },

  async getMe(token?: string): Promise<User> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    const data = await res.json();
    return data.data;
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    const data = await res.json();
    return data.data || [];
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
  }
};

