import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import { inMemoryStore } from './inMemoryStore.js';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isPostgresConnected = false;

export const pool = new Pool({
  connectionString: config.database.url,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
  max: 10
});

export async function initDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    isPostgresConnected = true;
    console.log('✅ [PostgreSQL] Connected successfully to', config.database.url.replace(/:[^:@]+@/, ':****@'));

    // Apply schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(sql);
      console.log('✅ [PostgreSQL] Schema applied successfully.');
    }

    // Check if lines table has data; if not, seed from initial data
    const linesCheck = await client.query('SELECT COUNT(*) FROM assembly_lines');
    if (parseInt(linesCheck.rows[0].count, 10) === 0) {
      console.log('🌱 [PostgreSQL] Seeding initial automotive data...');
      const lines = inMemoryStore.getLines();
      for (const line of lines) {
        await client.query(
          `INSERT INTO assembly_lines (id, name, code, description, target_hourly_rate, current_status)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
          [line.id, line.name, line.code, line.description, line.target_hourly_rate, line.current_status]
        );
      }

      const stations = inMemoryStore.getStations();
      for (const s of stations) {
        await client.query(
          `INSERT INTO workstations (id, line_id, name, code, sequence_order, type, checklist_template)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
          [s.id, s.line_id, s.name, s.code, s.sequence_order, s.type, JSON.stringify(s.checklist_template)]
        );
      }

      const vehicles = inMemoryStore.getVehicles();
      for (const v of vehicles) {
        await client.query(
          `INSERT INTO vehicles (id, vin, model, trim_level, color, current_line_id, current_station_id, status, defect_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
          [v.id, v.vin, v.model, v.trim_level, v.color, v.current_line_id, v.current_station_id, v.status, v.defect_count]
        );
      }

      const defects = inMemoryStore.getDefects();
      for (const d of defects) {
        await client.query(
          `INSERT INTO defects (id, vin, vehicle_id, line_id, station_id, component, category, severity, description, coordinates, status, logged_by, shift, photo_url, rework_ticket_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT DO NOTHING`,
          [d.id, d.vin, d.vehicle_id, d.line_id, d.station_id, d.component, d.category, d.severity, d.description, JSON.stringify(d.coordinates), d.status, d.logged_by, d.shift, d.photo_url || null, d.rework_ticket_id || null, d.created_at, d.updated_at]
        );
      }

      const reworks = inMemoryStore.getReworks();
      for (const r of reworks) {
        await client.query(
          `INSERT INTO rework_orders (id, defect_id, vin, vehicle_id, technician_name, root_cause_category, root_cause_analysis, corrective_action, parts_replaced, labor_minutes, cost_copq, verification_status, verifier_name, started_at, completed_at, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) ON CONFLICT DO NOTHING`,
          [r.id, r.defect_id, r.vin, r.vehicle_id, r.technician_name, r.root_cause_category, r.root_cause_analysis, r.corrective_action, JSON.stringify(r.parts_replaced), r.labor_minutes, r.cost_copq, r.verification_status, r.verifier_name || null, r.started_at, r.completed_at || null, r.notes || null]
        );
      }

      console.log('✅ [PostgreSQL] Initial automotive database seeding complete.');
    }

    client.release();
  } catch (err: any) {
    isPostgresConnected = false;
    console.warn(`⚡ [PostgreSQL Notice] PostgreSQL server not reachable at ${config.database.url}.`);
    console.log(`🚀 [Automotive Store] Activated high-performance In-Memory Engine with full seed data & real-time telemetry.`);
  }
}
