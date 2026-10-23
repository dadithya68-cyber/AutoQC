import { pool, isPostgresConnected } from '../db/db.js';
import { inMemoryStore } from '../db/inMemoryStore.js';
import { ReworkOrder } from '../types/index.js';
import { socketService } from './socketService.js';
import { redisService } from './redisService.js';

export class ReworkService {
  async getAllReworks(status?: string): Promise<ReworkOrder[]> {
    if (!isPostgresConnected) {
      return inMemoryStore.getReworks(status);
    }

    try {
      let query = `SELECT * FROM rework_orders WHERE 1=1`;
      const params: any[] = [];
      if (status) {
        query += ` AND verification_status = $1`;
        params.push(status);
      }
      query += ` ORDER BY started_at DESC`;
      const result = await pool.query(query, params);
      return result.rows.map(row => ({
        ...row,
        cost_copq: parseFloat(row.cost_copq) || 0,
        parts_replaced: typeof row.parts_replaced === 'string' ? JSON.parse(row.parts_replaced) : row.parts_replaced
      }));
    } catch {
      return inMemoryStore.getReworks(status);
    }
  }

  async getReworkById(id: string): Promise<ReworkOrder | null> {
    if (!isPostgresConnected) {
      return inMemoryStore.getReworkById(id) || null;
    }

    try {
      const result = await pool.query(`SELECT * FROM rework_orders WHERE id = $1`, [id]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        cost_copq: parseFloat(row.cost_copq) || 0,
        parts_replaced: typeof row.parts_replaced === 'string' ? JSON.parse(row.parts_replaced) : row.parts_replaced
      };
    } catch {
      return inMemoryStore.getReworkById(id) || null;
    }
  }

  async createRework(data: Omit<ReworkOrder, 'id' | 'started_at'>): Promise<ReworkOrder> {
    const memoryRework = inMemoryStore.createRework(data);

    if (isPostgresConnected) {
      try {
        await pool.query(
          `INSERT INTO rework_orders (id, defect_id, vin, vehicle_id, technician_name, root_cause_category, root_cause_analysis, corrective_action, parts_replaced, labor_minutes, cost_copq, verification_status, started_at, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            memoryRework.id,
            memoryRework.defect_id,
            memoryRework.vin,
            memoryRework.vehicle_id,
            memoryRework.technician_name,
            memoryRework.root_cause_category,
            memoryRework.root_cause_analysis,
            memoryRework.corrective_action,
            JSON.stringify(memoryRework.parts_replaced),
            memoryRework.labor_minutes,
            memoryRework.cost_copq,
            memoryRework.verification_status,
            memoryRework.started_at,
            memoryRework.notes || null
          ]
        );

        // Update defect status to ASSIGNED_REWORK
        await pool.query(
          `UPDATE defects SET status = 'ASSIGNED_REWORK', rework_ticket_id = $1, updated_at = NOW() WHERE id = $2`,
          [memoryRework.id, memoryRework.defect_id]
        );
      } catch (err) {
        console.error('Error inserting rework order into PostgreSQL:', err);
      }
    }

    await redisService.invalidatePattern('kpi');
    await redisService.invalidatePattern('analytics');

    socketService.emitEvent('REWORK_UPDATED', memoryRework);

    return memoryRework;
  }

  async updateRework(id: string, updates: Partial<ReworkOrder>): Promise<ReworkOrder | null> {
    const updated = inMemoryStore.updateRework(id, updates);
    if (!updated) return null;

    if (isPostgresConnected) {
      try {
        await pool.query(
          `UPDATE rework_orders 
           SET verification_status = COALESCE($1, verification_status),
               verifier_name = COALESCE($2, verifier_name),
               completed_at = CASE WHEN $1 = 'VERIFIED_PASS' THEN NOW() ELSE completed_at END,
               notes = COALESCE($3, notes)
           WHERE id = $4`,
          [updates.verification_status, updates.verifier_name, updates.notes, id]
        );

        if (updates.verification_status === 'VERIFIED_PASS') {
          await pool.query(`UPDATE defects SET status = 'CLOSED', updated_at = NOW() WHERE id = $1`, [updated.defect_id]);
        }
      } catch (err) {
        console.error('Error updating rework order in PostgreSQL:', err);
      }
    }

    await redisService.invalidatePattern('kpi');
    await redisService.invalidatePattern('analytics');

    socketService.emitEvent('REWORK_UPDATED', updated);

    return updated;
  }
}

export const reworkService = new ReworkService();
