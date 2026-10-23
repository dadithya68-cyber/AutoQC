import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { config } from '../config/index.js';

class RedisManager {
  private client: Redis | null = null;
  private subscriber: Redis | null = null;
  public isConnected = false;
  private localCache: Map<string, { value: any; expiry: number }> = new Map();
  private localEmitter: EventEmitter = new EventEmitter();

  constructor() {
    this.initClients();
  }

  private initClients() {
    try {
      this.client = new Redis(config.redis.url, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // don't spam reconnection if redis not running locally
        connectTimeout: 2000,
        lazyConnect: true
      });

      this.subscriber = new Redis(config.redis.url, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        connectTimeout: 2000,
        lazyConnect: true
      });

      this.client.connect()
        .then(() => {
          this.isConnected = true;
          console.log('✅ [Redis] Connected successfully to', config.redis.url);
          this.subscriber?.connect().catch(() => {});
        })
        .catch(() => {
          this.isConnected = false;
          console.log('⚡ [Redis Notice] Redis not reachable on', config.redis.url);
          console.log('🚀 [Redis Service] Operating in resilient embedded In-Memory Cache & Pub/Sub mode.');
        });

      this.client.on('error', () => {
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch {
        // Fallback to local
      }
    }

    const item = this.localCache.get(key);
    if (item) {
      if (Date.now() > item.expiry) {
        this.localCache.delete(key);
        return null;
      }
      return item.value as T;
    }
    return null;
  }

  async set(key: string, value: any, ttlSeconds: number = config.cacheTtlSeconds): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } catch {
        // Fallback to local
      }
    }

    this.localCache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  async invalidatePattern(prefix: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch {
        // Continue to local
      }
    }

    for (const key of this.localCache.keys()) {
      if (key.startsWith(prefix)) {
        this.localCache.delete(key);
      }
    }
  }

  async publish(channel: string, message: any): Promise<void> {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    if (this.isConnected && this.client) {
      try {
        await this.client.publish(channel, payload);
      } catch {
        // fallback to local emitter
      }
    }

    this.localEmitter.emit(channel, payload);
  }

  subscribe(channel: string, callback: (message: any) => void): void {
    if (this.isConnected && this.subscriber) {
      this.subscriber.subscribe(channel, (err) => {
        if (!err) {
          this.subscriber?.on('message', (chan, msg) => {
            if (chan === channel) {
              try {
                callback(JSON.parse(msg));
              } catch {
                callback(msg);
              }
            }
          });
        }
      });
    }

    // Always listen to local emitter as well
    this.localEmitter.on(channel, (msg) => {
      try {
        callback(JSON.parse(msg));
      } catch {
        callback(msg);
      }
    });
  }
}

export const redisService = new RedisManager();
