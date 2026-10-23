import { Request, Response } from 'express';
import { inspectionService } from '../services/inspectionService.js';
import { z } from 'zod';

const createInspectionSchema = z.object({
  vehicle_id: z.string(),
  vin: z.string(),
  station_id: z.string(),
  line_id: z.string(),
  inspector_name: z.string().min(2),
  shift: z.enum(['Shift A (Morning)', 'Shift B (Evening)', 'Shift C (Night)']),
  status: z.enum(['PASSED', 'FAILED', 'CONDITIONAL_PASS']),
  notes: z.string().optional(),
  checklist_results: z.array(z.object({
    checklist_id: z.string(),
    label: z.string(),
    status: z.enum(['PASS', 'FAIL']),
    actual_value: z.string().optional(),
    notes: z.string().optional()
  })),
  defects_found: z.number().int().min(0).default(0),
  duration_seconds: z.number().int().min(1).default(120)
});

export const getInspections = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const inspections = await inspectionService.getInspections(limit);
    res.json({ success: true, count: inspections.length, data: inspections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInspectionById = async (req: Request, res: Response) => {
  try {
    const inspection = await inspectionService.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection record not found' });
    }
    res.json({ success: true, data: inspection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordInspection = async (req: Request, res: Response) => {
  try {
    const validated = createInspectionSchema.parse(req.body);
    const inspection = await inspectionService.recordInspection(validated as any);
    res.status(201).json({ success: true, message: 'Inspection submitted successfully', data: inspection });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
