import { Router } from 'express';
import { getLines, updateLineStatus, getStations, getVehicles, getVehicleByVin, createVehicle } from '../controllers/assemblyController.js';
import { getDefects, getDefectById, createDefect, updateDefect } from '../controllers/defectController.js';
import { getInspections, getInspectionById, recordInspection } from '../controllers/inspectionController.js';
import { getReworks, getReworkById, createRework, updateRework } from '../controllers/reworkController.js';
import { getQualityKPIs, getParetoAnalysis, getProductionQualityTrends, getVehicleZoneHeatmap } from '../controllers/analyticsController.js';
import { inMemoryStore } from '../db/inMemoryStore.js';
import { isPostgresConnected } from '../db/db.js';
import { redisService } from '../services/redisService.js';

const router = Router();

// Health & System status
router.get('/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'AutoQC Quality Platform',
    timestamp: new Date().toISOString(),
    services: {
      database: isPostgresConnected ? 'POSTGRESQL_CONNECTED' : 'PERSISTENT_FILE_DATABASE',
      cache: redisService.isConnected ? 'REDIS_CONNECTED' : 'IN_MEMORY_CACHE_ACTIVE',
      realtime_websocket: 'ACTIVE'
    }
  });
});

// Authentication Endpoints
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const user = inMemoryStore.authenticateUser(username, password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your username and password.' });
  }

  const { password: _, ...safeUser } = user;
  const token = `autoqc_jwt_${user.id}_${Date.now()}`;

  inMemoryStore.addActivity({
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    title: `Operator Signed In`,
    subtitle: `${user.name} (${user.title}) authenticated`,
    type: 'quality',
    severity: 'info',
    stationId: user.stationOrLine || 'Central'
  });

  return res.json({
    success: true,
    data: {
      user: safeUser,
      token
    }
  });
});

router.get('/auth/users', (_req, res) => {
  return res.json({
    success: true,
    data: inMemoryStore.getUsers()
  });
});

router.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const admin = inMemoryStore.getUserById('user-admin');
    return res.json({ success: true, data: admin });
  }
  const parts = authHeader.replace('Bearer ', '').split('_');
  const userId = parts[2];
  const user = userId ? inMemoryStore.getUserById(userId) : inMemoryStore.getUserById('user-admin');
  return res.json({ success: true, data: user });
});

router.post('/auth/logout', (_req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});


// Database Storage Status
router.get('/database/status', (_req, res) => {
  res.json({
    success: true,
    data: inMemoryStore.getDatabaseInfo()
  });
});

// Dashboard Specific Endpoints matching reference design
router.get('/dashboard/summary', (_req, res) => {
  res.json({
    success: true,
    data: inMemoryStore.getDashboardSummary()
  });
});

router.get('/dashboard/stages', (_req, res) => {
  res.json({
    success: true,
    data: inMemoryStore.getStages()
  });
});

router.get('/dashboard/activity', (_req, res) => {
  res.json({
    success: true,
    data: inMemoryStore.getActivities()
  });
});

router.get('/analytics/defect-rate-history', (_req, res) => {
  res.json({
    success: true,
    data: inMemoryStore.getDefectRateHistory()
  });
});

// Assembly Lines & Workstations
router.get('/lines', getLines);
router.patch('/lines/:id/status', updateLineStatus);
router.get('/stations', getStations);

// Vehicles
router.get('/vehicles', getVehicles);
router.get('/vehicles/:vin', getVehicleByVin);
router.post('/vehicles', createVehicle);

// Defects
router.get('/defects', getDefects);
router.get('/defects/:id', getDefectById);
router.post('/defects', createDefect);
router.patch('/defects/:id', updateDefect);

// Inspections
router.get('/inspections', getInspections);
router.get('/inspections/:id', getInspectionById);
router.post('/inspections', recordInspection);

// Rework Orders
router.get('/reworks', getReworks);
router.get('/reworks/:id', getReworkById);
router.post('/reworks', createRework);
router.patch('/reworks/:id', updateRework);

// Analytics & Trends
router.get('/analytics/kpis', getQualityKPIs);
router.get('/analytics/pareto', getParetoAnalysis);
router.get('/analytics/trends', getProductionQualityTrends);
router.get('/analytics/heatmap', getVehicleZoneHeatmap);

export default router;
