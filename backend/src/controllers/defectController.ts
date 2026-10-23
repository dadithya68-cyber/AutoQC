import { Request, Response } from 'express';
import { defectService } from '../services/defectService.js';
import { z } from 'zod';

const createDefectSchema = z.object({
  vin: z.string().min(11).max(17),
  vehicle_id: z.string(),
  inspection_id: z.string().optional(),
  line_id: z.string(),
  line_name: z.string().optional(),
  station_id: z.string(),
  station_name: z.string().optional(),
  component: z.string().min(2),
  category: z.enum(['PAINT', 'BODY_WELD', 'DIMENSIONAL', 'ELECTRICAL', 'MECHANICAL', 'TORQUE', 'SURFACE_SCRATCH', 'ALIGNMENT']),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  description: z.string().min(3),
  coordinates: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    view: z.enum(['top', 'side_left', 'side_right', 'front', 'rear']),
    zone: z.enum(['HOOD', 'ROOF', 'TRUNK', 'DOOR_FL', 'DOOR_FR', 'DOOR_RL', 'DOOR_RR', 'BUMPER_FRONT', 'BUMPER_REAR', 'WINDSHIELD', 'UNDERBODY', 'BATTERY_PACK', 'CABIN_INTERIOR', 'POWERTRAIN'])
  }),
  status: z.enum(['LOGGED', 'IN_REVIEW', 'ASSIGNED_REWORK', 'REWORK_COMPLETED', 'VERIFIED', 'CLOSED']).default('LOGGED'),
  logged_by: z.string().min(2),
  shift: z.enum(['Shift A (Morning)', 'Shift B (Evening)', 'Shift C (Night)']),
  photo_url: z.string().optional()
});

export const getDefects = async (req: Request, res: Response) => {
  try {
    const { lineId, stationId, severity, status, vin, category } = req.query;
    const defects = await defectService.getAllDefects({
      lineId: lineId as string,
      stationId: stationId as string,
      severity: severity as string,
      status: status as string,
      vin: vin as string,
      category: category as string
    });
    res.json({ success: true, count: defects.length, data: defects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDefectById = async (req: Request, res: Response) => {
  try {
    const defect = await defectService.getDefectById(req.params.id);
    if (!defect) {
      return res.status(404).json({ success: false, message: 'Defect not found' });
    }
    res.json({ success: true, data: defect });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDefect = async (req: Request, res: Response) => {
  try {
    const validated = createDefectSchema.parse(req.body);
    const defect = await defectService.createDefect(validated as any);
    res.status(201).json({ success: true, message: 'Defect logged successfully', data: defect });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDefect = async (req: Request, res: Response) => {
  try {
    const updated = await defectService.updateDefect(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Defect not found' });
    }
    res.json({ success: true, message: 'Defect updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
