import { Request, Response } from 'express';
import { assemblyService } from '../services/assemblyService.js';
import { z } from 'zod';

export const getLines = async (_req: Request, res: Response) => {
  try {
    const lines = await assemblyService.getLines();
    res.json({ success: true, count: lines.length, data: lines });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLineStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['RUNNING', 'SLOWED', 'HALTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be RUNNING, SLOWED, or HALTED' });
    }
    const updated = await assemblyService.updateLineStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Line not found' });
    }
    res.json({ success: true, message: `Assembly line status updated to ${status}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStations = async (req: Request, res: Response) => {
  try {
    const lineId = req.query.lineId as string;
    const stations = await assemblyService.getStations(lineId);
    res.json({ success: true, count: stations.length, data: stations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { status, lineId } = req.query;
    const vehicles = await assemblyService.getVehicles(status as string, lineId as string);
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVehicleByVin = async (req: Request, res: Response) => {
  try {
    const vehicle = await assemblyService.getVehicleByVin(req.params.vin);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle with specified VIN not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createVehicleSchema = z.object({
  vin: z.string().min(11).max(17),
  model: z.string().min(2),
  trim_level: z.string().min(2),
  color: z.string().min(2),
  current_line_id: z.string(),
  current_station_id: z.string(),
  status: z.enum(['IN_PRODUCTION', 'QUALITY_HOLD', 'REWORK_REQUIRED', 'PASSED_QA', 'SCRAPPED']).default('IN_PRODUCTION')
});

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const validated = createVehicleSchema.parse(req.body);
    const vehicle = await assemblyService.createVehicle(validated as any);
    res.status(201).json({ success: true, message: 'Vehicle launched into production', data: vehicle });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
