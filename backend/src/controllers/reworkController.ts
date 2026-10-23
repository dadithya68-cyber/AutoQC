import { Request, Response } from 'express';
import { reworkService } from '../services/reworkService.js';
import { z } from 'zod';

const createReworkSchema = z.object({
  defect_id: z.string(),
  vin: z.string(),
  vehicle_id: z.string(),
  technician_name: z.string().min(2),
  root_cause_category: z.enum(['MAN', 'MACHINE', 'METHOD', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT']),
  root_cause_analysis: z.string().min(5),
  corrective_action: z.string().min(5),
  parts_replaced: z.array(z.string()).default([]),
  labor_minutes: z.number().int().min(1).default(30),
  cost_copq: z.number().min(0).default(0),
  verification_status: z.enum(['PENDING', 'VERIFIED_PASS', 'FAILED_RE_REWORK']).default('PENDING'),
  notes: z.string().optional()
});

export const getReworks = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const reworks = await reworkService.getAllReworks(status as string);
    res.json({ success: true, count: reworks.length, data: reworks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReworkById = async (req: Request, res: Response) => {
  try {
    const rework = await reworkService.getReworkById(req.params.id);
    if (!rework) {
      return res.status(404).json({ success: false, message: 'Rework order not found' });
    }
    res.json({ success: true, data: rework });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRework = async (req: Request, res: Response) => {
  try {
    const validated = createReworkSchema.parse(req.body);
    const rework = await reworkService.createRework(validated as any);
    res.status(201).json({ success: true, message: 'Rework ticket dispatched successfully', data: rework });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRework = async (req: Request, res: Response) => {
  try {
    const updated = await reworkService.updateRework(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Rework order not found' });
    }
    res.json({ success: true, message: 'Rework ticket updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
