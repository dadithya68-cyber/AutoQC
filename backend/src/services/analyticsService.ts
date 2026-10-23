import { pool, isPostgresConnected } from '../db/db.js';
import { inMemoryStore } from '../db/inMemoryStore.js';
import { QualityMetricsSummary, ParetoItem, LineQualityTrend, ZoneHeatmapItem } from '../types/index.js';
import { redisService } from './redisService.js';

export class AnalyticsService {
  async getQualityMetrics(): Promise<QualityMetricsSummary> {
    const cacheKey = 'kpi:summary';
    const cached = await redisService.get<QualityMetricsSummary>(cacheKey);
    if (cached) return cached;

    if (!isPostgresConnected) {
      const metrics = inMemoryStore.getQualityMetrics();
      await redisService.set(cacheKey, metrics, 30);
      return metrics;
    }

    try {
      // Query PostgreSQL
      const inspStats = await pool.query(`
        SELECT 
          COUNT(*) as total_inspections,
          COUNT(CASE WHEN status = 'PASSED' THEN 1 END) as passed_inspections,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_inspections
        FROM inspections
      `);

      const defectStats = await pool.query(`
        SELECT 
          COUNT(*) as total_defects,
          COUNT(CASE WHEN status NOT IN ('CLOSED', 'VERIFIED') THEN 1 END) as open_defects,
          COUNT(CASE WHEN severity = 'CRITICAL' AND status != 'CLOSED' THEN 1 END) as critical_defects
        FROM defects
      `);

      const vehStats = await pool.query(`SELECT COUNT(*) as total_vehicles FROM vehicles`);
      const reworkStats = await pool.query(`
        SELECT 
          COUNT(CASE WHEN verification_status = 'PENDING' THEN 1 END) as active_reworks,
          AVG(labor_minutes) as avg_labor,
          SUM(cost_copq) as total_copq
        FROM rework_orders
      `);

      const totalInspections = parseInt(inspStats.rows[0].total_inspections, 10) || 0;
      const passedInspections = parseInt(inspStats.rows[0].passed_inspections, 10) || 0;
      const failedInspections = parseInt(inspStats.rows[0].failed_inspections, 10) || 0;
      const ftq = totalInspections > 0 ? Number(((passedInspections / totalInspections) * 100).toFixed(1)) : 92.4;

      const totalDefects = parseInt(defectStats.rows[0].total_defects, 10) || 0;
      const openDefects = parseInt(defectStats.rows[0].open_defects, 10) || 0;
      const criticalDefects = parseInt(defectStats.rows[0].critical_defects, 10) || 0;

      const totalVehicles = Math.max(parseInt(vehStats.rows[0].total_vehicles, 10) || 1, 1);
      const dpu = Number((totalDefects / totalVehicles).toFixed(2));
      const dpmo = Math.round((totalDefects / (totalVehicles * 45)) * 1000000);

      const activeReworks = parseInt(reworkStats.rows[0].active_reworks, 10) || 0;
      const avgReworkMinutes = Math.round(parseFloat(reworkStats.rows[0].avg_labor) || 35);
      const totalCopqUsd = Number(parseFloat(reworkStats.rows[0].total_copq || 0).toFixed(2));

      const result: QualityMetricsSummary = {
        first_time_quality_pct: ftq,
        total_inspections: totalInspections,
        passed_inspections: passedInspections,
        failed_inspections: failedInspections,
        total_defects: totalDefects,
        open_defects: openDefects,
        critical_defects: criticalDefects,
        defects_per_unit: dpu,
        defects_per_million_opp: dpmo,
        active_reworks: activeReworks,
        average_rework_minutes: avgReworkMinutes,
        total_copq_usd: totalCopqUsd
      };

      await redisService.set(cacheKey, result, 30);
      return result;
    } catch {
      const metrics = inMemoryStore.getQualityMetrics();
      await redisService.set(cacheKey, metrics, 30);
      return metrics;
    }
  }

  async getParetoData(): Promise<ParetoItem[]> {
    const cacheKey = 'analytics:pareto';
    const cached = await redisService.get<ParetoItem[]>(cacheKey);
    if (cached) return cached;

    if (!isPostgresConnected) {
      const data = inMemoryStore.getParetoData();
      await redisService.set(cacheKey, data, 60);
      return data;
    }

    try {
      const result = await pool.query(`
        SELECT category, COUNT(*) as count 
        FROM defects 
        GROUP BY category 
        ORDER BY count DESC
      `);

      const totalDefects = result.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0) || 1;
      let runningSum = 0;

      const pareto: ParetoItem[] = result.rows.map(row => {
        const count = parseInt(row.count, 10);
        runningSum += count;
        return {
          category: row.category.replace('_', ' '),
          count,
          percentage: Number(((count / totalDefects) * 100).toFixed(1)),
          cumulative_percentage: Number(((runningSum / totalDefects) * 100).toFixed(1))
        };
      });

      await redisService.set(cacheKey, pareto, 60);
      return pareto;
    } catch {
      const data = inMemoryStore.getParetoData();
      await redisService.set(cacheKey, data, 60);
      return data;
    }
  }

  async getQualityTrends(): Promise<LineQualityTrend[]> {
    const cacheKey = 'analytics:trends';
    const cached = await redisService.get<LineQualityTrend[]>(cacheKey);
    if (cached) return cached;

    const data = inMemoryStore.getQualityTrends();
    await redisService.set(cacheKey, data, 60);
    return data;
  }

  async getZoneHeatmap(): Promise<ZoneHeatmapItem[]> {
    const cacheKey = 'analytics:heatmap';
    const cached = await redisService.get<ZoneHeatmapItem[]>(cacheKey);
    if (cached) return cached;

    const data = inMemoryStore.getZoneHeatmap();
    await redisService.set(cacheKey, data, 60);
    return data;
  }
}

export const analyticsService = new AnalyticsService();
