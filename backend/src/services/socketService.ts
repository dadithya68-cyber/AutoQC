import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { redisService } from './redisService.js';

export interface SocketEventPayload {
  type: 'DEFECT_LOGGED' | 'DEFECT_UPDATED' | 'INSPECTION_COMPLETED' | 'REWORK_UPDATED' | 'LINE_STATUS_CHANGED' | 'LINE_ALERT';
  data: any;
  timestamp: string;
}

class SocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  init(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      // Send initial welcome/handshake
      ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        data: { message: 'Connected to Automotive Quality Telemetry Real-time Stream' },
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch {
          // ignore invalid json ping
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', () => {
        this.clients.delete(ws);
      });
    });

    // Listen to Redis Pub/Sub events and broadcast to all connected WebSocket clients
    redisService.subscribe('automotive:events', (event: SocketEventPayload) => {
      this.broadcast(event);
    });

    console.log('📡 [WebSocket Server] Initialized on path /ws');
  }

  broadcast(event: SocketEventPayload): void {
    const payload = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  emitEvent(type: SocketEventPayload['type'], data: any): void {
    const event: SocketEventPayload = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    // Publish via Redis so multi-instance setups propagate seamlessly
    redisService.publish('automotive:events', event);
  }
}

export const socketService = new SocketService();
