import { pool, isPostgresConnected } from '../db/db.js';
import { inMemoryStore } from '../db/inMemoryStore.js';
import { AssemblyLine, Workstation, Vehicle } from '../types/index.js';
import { socketService } from './socketService.js';

export class AssemblyService {
  async getLines(): Promise<AssemblyLine[]> {
    if (!isPostgresConnected) {
      return inMemoryStore.getLines();
    }

    try {
      const result = await pool.query('SELECT * FROM assembly_lines ORDER BY code ASC');
      return result.rows;
    } catch {
      return inMemoryStore.getLines();
    }
  }

  async updateLineStatus(id: string, status: 'RUNNING' | 'SLOWED' | 'HALTED'): Promise<AssemblyLine | null> {
    const updated = inMemoryStore.updateLineStatus(id, status);
    if (!updated) return null;

    if (isPostgresConnected) {
      try {
        await pool.query('UPDATE assembly_lines SET current_status = $1 WHERE id = $2', [status, id]);
      } catch (err) {
        console.error('Error updating line status in PostgreSQL:', err);
      }
    }

    socketService.emitEvent('LINE_STATUS_CHANGED', updated);
    return updated;
  }

  async getStations(lineId?: string): Promise<Workstation[]> {
    if (!isPostgresConnected) {
      return inMemoryStore.getStations(lineId);
    }

    try {
      let query = 'SELECT * FROM workstations';
      const params: any[] = [];
      if (lineId) {
        query += ' WHERE line_id = $1';
        params.push(lineId);
      }
      query += ' ORDER BY sequence_order ASC';
      const result = await pool.query(query, params);
      return result.rows.map(row => ({
        ...row,
        checklist_template: typeof row.checklist_template === 'string' ? JSON.parse(row.checklist_template) : row.checklist_template
      }));
    } catch {
      return inMemoryStore.getStations(lineId);
    }
  }

  async getVehicles(status?: string, lineId?: string): Promise<Vehicle[]> {
    if (!isPostgresConnected) {
      return inMemoryStore.getVehicles(status, lineId);
    }

    try {
      let query = 'SELECT * FROM vehicles WHERE 1=1';
      const params: any[] = [];
      let pIdx = 1;
      if (status) {
        query += ` AND status = $${pIdx++}`;
        params.push(status);
      }
      if (lineId) {
        query += ` AND current_line_id = $${pIdx++}`;
        params.push(lineId);
      }
      query += ' ORDER BY manufactured_date DESC';
      const result = await pool.query(query, params);
      return result.rows;
    } catch {
      return inMemoryStore.getVehicles(status, lineId);
    }
  }

  async getVehicleByVin(vin: string): Promise<Vehicle | null> {
    if (!isPostgresConnected) {
      return inMemoryStore.getVehicleByVin(vin) || null;
    }

    try {
      const result = await pool.query('SELECT * FROM vehicles WHERE UPPER(vin) = UPPER($1)', [vin]);
      return result.rows[0] || null;
    } catch {
      return inMemoryStore.getVehicleByVin(vin) || null;
    }
  }

  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'defect_count' | 'manufactured_date'>): Promise<Vehicle> {
    const memoryVehicle = inMemoryStore.createVehicle(vehicleData);

    if (isPostgresConnected) {
      try {
        await pool.query(
          `INSERT INTO vehicles (id, vin, model, trim_level, color, current_line_id, current_station_id, status, defect_count, manufactured_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            memoryVehicle.id,
            memoryVehicle.vin,
            memoryVehicle.model,
            memoryVehicle.trim_level,
            memoryVehicle.color,
            memoryVehicle.current_line_id,
            memoryVehicle.current_station_id,
            memoryVehicle.status,
            memoryVehicle.defect_count,
            memoryVehicle.manufactured_date
          ]
        );
      } catch (err) {
        console.error('Error inserting vehicle into PostgreSQL:', err);
      }
    }

    return memoryVehicle;
  }
}

export const assemblyService = new AssemblyService();
