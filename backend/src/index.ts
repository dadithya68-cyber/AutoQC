import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { initDatabase } from './db/db.js';
import { socketService } from './services/socketService.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Mount REST API endpoints
app.use('/api', apiRoutes);

// Discover frontend distribution directory
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist')
];

const frontendDistPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (frontendDistPath) {
  console.log(`📦 [Unified Server] Serving React Frontend from: ${frontendDistPath}`);
  
  // Serve static assets (js, css, icons)
  app.use(express.static(frontendDistPath));

  // SPA fallback: Send index.html for any client navigation route that is not /api
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.warn(`⚠️ [Unified Server] Frontend dist directory not found. Please run 'npm run build' in frontend/`);
  
  // Informational root endpoint if frontend is not built
  app.get('/', (_req, res) => {
    res.json({
      project: 'Automotive Assembly Quality Assurance & Defect Monitoring Platform',
      version: '1.0.0',
      notice: 'Frontend not yet compiled. Build frontend or run in dev mode.',
      documentation: '/api/health',
      endpoints: {
        health: '/api/health',
        lines: '/api/lines',
        stations: '/api/stations',
        vehicles: '/api/vehicles',
        defects: '/api/defects',
        inspections: '/api/inspections',
        reworks: '/api/reworks',
        analytics: {
          kpis: '/api/analytics/kpis',
          pareto: '/api/analytics/pareto',
          trends: '/api/analytics/trends',
          heatmap: '/api/analytics/heatmap'
        },
        websocket: 'ws://localhost:' + config.port + '/ws'
      }
    });
  });
}

// Initialize real-time WebSocket telemetry on the same server
socketService.init(server);

// Start unified server
server.listen(config.port, async () => {
  console.log(`=======================================================`);
  console.log(` 🚗 APEX MOTORS QUALITY ASSURANCE & DEFECT TELEMETRY  `);
  console.log(` 🌐 Unified Platform: http://localhost:${config.port}         `);
  console.log(` 🔌 REST API Root:    http://localhost:${config.port}/api     `);
  console.log(` ⚡ WebSocket Stream: ws://localhost:${config.port}/ws       `);
  console.log(`=======================================================`);

  // Initialize DB asynchronously
  await initDatabase();
});

// Handle graceful exit
process.on('SIGINT', () => {
  console.log('\nShutting down Apex QA server...');
  server.close(() => {
    process.exit(0);
  });
});
