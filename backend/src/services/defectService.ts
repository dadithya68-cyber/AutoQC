import { pool, isPostgresConnected } from '../db/db.js';
import { inMemoryStore } from '../db/inMemoryStore.js';
import { Defect } from '../types/index.js';
import { socketService } from './socketService.js';
import { redisService } from './redisService.js';

export class DefectService {
  async getAllDefects(filters?: {
    lineId?: string;
    stationId?: string;
    severity?: string;
    status?: string;
    vin?: string;
    category?: string;
  }): Promise<Defect[]> {
    if (!isPostgresConnected) {
      return inMemoryStore.getDefects(filters);
    }

    try {
      let query = `
        SELECT d.*, l.name as line_name, w.name as station_name 
        FROM defects d
        LEFT JOIN assembly_lines l ON d.line_id = l.id
        LEFT JOIN workstations w ON d.station_id = w.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIdx = 1;

      if (filters?.lineId) {
        query += ` AND d.line_id = $${paramIdx++}`;
        params.push(filters.lineId);
      }
      if (filters?.stationId) {
        query += ` AND d.station_id = $${paramIdx++}`;
        params.push(filters.stationId);
      }
      if (filters?.severity) {
        query += ` AND d.severity = $${paramIdx++}`;
        params.push(filters.severity);
      }
      if (filters?.status) {
        query += ` AND d.status = $${paramIdx++}`;
        params.push(filters.status);
      }
      if (filters?.vin) {
        query += ` AND d.vin ILIKE $${paramIdx++}`;
        params.push(`%${filters.vin}%`);
      }
      if (filters?.category) {
        query += ` AND d.category = $${paramIdx++}`;
        params.push(filters.category);
      }

      query += ` ORDER BY d.created_at DESC`;
      const result = await pool.query(query, params);
      return result.rows.map(row => ({
        ...row,
        coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates
      }));
    } catch (err) {
      console.warn('Postgres defect query error, falling back to in-memory store:', err);
      return inMemoryStore.getDefects(filters);
    }
  }

  async getDefectById(id: string): Promise<Defect | null> {
    if (!isPostgresConnected) {
      return inMemoryStore.getDefectById(id) || null;
    }

    try {
      const result = await pool.query(
        `SELECT d.*, l.name as line_name, w.name as station_name 
         FROM defects d
         LEFT JOIN assembly_lines l ON d.line_id = l.id
         LEFT JOIN workstations w ON d.station_id = w.id
         WHERE d.id = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates
      };
    } catch {
      return inMemoryStore.getDefectById(id) || null;
    }
  }

  async createDefect(defectData: Omit<Defect, 'id' | 'created_at' | 'updated_at'>): Promise<Defect> {
    const memoryDefect = inMemoryStore.createDefect(defectData);

    if (isPostgresConnected) {
      try {
        await pool.query(
          `INSERT INTO defects (id, vin, vehicle_id, inspection_id, line_id, station_id, component, category, severity, description, coordinates, status, logged_by, shift, photo_url, rework_ticket_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            memoryDefect.id,
            memoryDefect.vin,
            memoryDefect.vehicle_id,
            memoryDefect.inspection_id || null,
            memoryDefect.line_id,
            memoryDefect.station_id,
            memoryDefect.component,
            memoryDefect.category,
            memoryDefect.severity,
            memoryDefect.description,
            JSON.stringify(memoryDefect.coordinates),
            memoryDefect.status,
            memoryDefect.logged_by,
            memoryDefect.shift,
            memoryDefect.photo_url || null,
            memoryDefect.rework_ticket_id || null,
            memoryDefect.created_at,
            memoryDefect.updated_at
          ]
        );

        // Update vehicle status in DB
        await pool.query(
          `UPDATE vehicles SET defect_count = defect_count + 1, 
           status = CASE WHEN $1 = 'CRITICAL' THEN 'QUALITY_HOLD' ELSE 'REWORK_REQUIRED' END 
           WHERE id = $2 OR vin = $3`,
          [memoryDefect.severity, memoryDefect.vehicle_id, memoryDefect.vin]
        );
      } catch (err) {
        console.error('Error inserting defect into PostgreSQL:', err);
      }
    }

    // Invalidate caches
    await redisService.invalidatePattern('kpi');
    await redisService.invalidatePattern('analytics');

    // Real-time broadcast
    socketService.emitEvent('DEFECT_LOGGED', memoryDefect);

    return memoryDefect;
  }

  async updateDefect(id: string, updates: Partial<Defect>): Promise<Defect | null> {
    const updated = inMemoryStore.updateDefect(id, updates);
    if (!updated) return null;

    if (isPostgresConnected) {
      try {
        await pool.query(
          `UPDATE defects 
           SET status = COALESCE($1, status), 
               severity = COALESCE($2, severity), 
               description = COALESCE($3, description), 
               rework_ticket_id = COALESCE($4, rework_ticket_id),
               updated_at = NOW() 
           WHERE id = $5`,
          [updates.status, updates.severity, updates.description, updates.rework_ticket_id, id]
        );
      } catch (err) {
        console.error('Error updating defect in PostgreSQL:', err);
      }
    }

    await redisService.invalidatePattern('kpi');
    await redisService.invalidatePattern('analytics');
    socketService.emitEvent('DEFECT_UPDATED', updated);

    return updated;
  }
}

export const defectService = new DefectService();
