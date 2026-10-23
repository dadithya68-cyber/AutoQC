import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService.js';

export const getQualityKPIs = async (req: Request, res: Response) => {
  try {
    const kpis = await analyticsService.getQualityMetrics();
    res.json({ success: true, data: kpis });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getParetoAnalysis = async (req: Request, res: Response) => {
  try {
    const pareto = await analyticsService.getParetoData();
    res.json({ success: true, data: pareto });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductionQualityTrends = async (req: Request, res: Response) => {
  try {
    const trends = await analyticsService.getQualityTrends();
    res.json({ success: true, data: trends });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVehicleZoneHeatmap = async (req: Request, res: Response) => {
  try {
    const heatmap = await analyticsService.getZoneHeatmap();
    res.json({ success: true, data: heatmap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
