import { pool, isPostgresConnected } from '../db/db.js';
import { inMemoryStore } from '../db/inMemoryStore.js';
import { Inspection } from '../types/index.js';
import { socketService } from './socketService.js';
import { redisService } from './redisService.js';

export class InspectionService {
  async getInspections(limit = 50): Promise<Inspection[]> {
    if (!isPostgresConnected) {
      return inMemoryStore.getInspections(limit);
    }

    try {
      const result = await pool.query(
        `SELECT i.*, l.name as line_name, w.name as station_name 
         FROM inspections i
         LEFT JOIN assembly_lines l ON i.line_id = l.id
         LEFT JOIN workstations w ON i.station_id = w.id
         ORDER BY i.created_at DESC LIMIT $1`,
        [limit]
      );
      return result.rows.map(row => ({
        ...row,
        checklist_results: typeof row.checklist_results === 'string' ? JSON.parse(row.checklist_results) : row.checklist_results
      }));
    } catch {
      return inMemoryStore.getInspections(limit);
    }
  }

  async getInspectionById(id: string): Promise<Inspection | null> {
    if (!isPostgresConnected) {
      return inMemoryStore.getInspectionById(id) || null;
    }

    try {
      const result = await pool.query(
        `SELECT i.*, l.name as line_name, w.name as station_name 
         FROM inspections i
         LEFT JOIN assembly_lines l ON i.line_id = l.id
         LEFT JOIN workstations w ON i.station_id = w.id
         WHERE i.id = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        checklist_results: typeof row.checklist_results === 'string' ? JSON.parse(row.checklist_results) : row.checklist_results
      };
    } catch {
      return inMemoryStore.getInspectionById(id) || null;
    }
  }

  async recordInspection(data: Omit<Inspection, 'id' | 'created_at'>): Promise<Inspection> {
    const memoryInspection = inMemoryStore.createInspection(data);

    if (isPostgresConnected) {
      try {
        await pool.query(
          `INSERT INTO inspections (id, vehicle_id, vin, station_id, line_id, inspector_name, shift, status, notes, checklist_results, defects_found, duration_seconds, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            memoryInspection.id,
            memoryInspection.vehicle_id,
            memoryInspection.vin,
            memoryInspection.station_id,
            memoryInspection.line_id,
            memoryInspection.inspector_name,
            memoryInspection.shift,
            memoryInspection.status,
            memoryInspection.notes || null,
            JSON.stringify(memoryInspection.checklist_results),
            memoryInspection.defects_found,
            memoryInspection.duration_seconds,
            memoryInspection.created_at
          ]
        );
      } catch (err) {
        console.error('Error inserting inspection into PostgreSQL:', err);
      }
    }

    await redisService.invalidatePattern('kpi');
    await redisService.invalidatePattern('analytics');

    socketService.emitEvent('INSPECTION_COMPLETED', memoryInspection);

    return memoryInspection;
  }
}

export const inspectionService = new InspectionService();
