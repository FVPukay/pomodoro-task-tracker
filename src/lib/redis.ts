// src/lib/redis.ts
// Singleton Redis client to prevent connection pooling issues

import { createClient } from 'redis';

type RedisClientType = ReturnType<typeof createClient>;

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  // If no client exists, create one
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    });

    // Error handler to prevent crashes
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Reconnect handler for development
    client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });

    // Connect to Redis
    await client.connect();
  }

  // If client exists but is not connected (e.g., timed out), reconnect
  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (err) {
      console.error('Failed to reconnect to Redis:', err);
      // Reset client and try creating a fresh one
      client = null;
      return getRedisClient(); // Recursive call to create new client
    }
  }

  return client;
}

// Optional: Graceful shutdown helper
export async function closeRedisClient(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
