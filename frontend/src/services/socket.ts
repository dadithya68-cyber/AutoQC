type EventCallback = (data: any) => void;
type ConnectionCallback = (status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED') => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private reconnectTimeout: any = null;
  private pingInterval: any = null;
  private status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' = 'DISCONNECTED';

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('CONNECTING');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect through the Vite dev proxy or host
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('CONNECTED');
        console.log('📡 [WebSocket] Connected to automotive telemetry stream');
        
        // Start ping heartbeat every 15s
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type) {
            const handlers = this.listeners.get(parsed.type);
            if (handlers) {
              handlers.forEach(fn => fn(parsed.data));
            }
            // General wildcard listener
            const allHandlers = this.listeners.get('*');
            if (allHandlers) {
              allHandlers.forEach(fn => fn(parsed));
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message', err);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('DISCONNECTED');
        this.cleanup();
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.setStatus('DISCONNECTED');
        this.cleanup();
        this.scheduleReconnect();
      };
    } catch {
      this.setStatus('DISCONNECTED');
      this.scheduleReconnect();
    }
  }

  private setStatus(status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED') {
    this.status = status;
    this.connectionListeners.forEach(fn => fn(status));
  }

  getStatus(): 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' {
    return this.status;
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    callback(this.status);
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  on(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 3000);
  }
}

export const socketClient = new SocketClient();
