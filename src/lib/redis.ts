// src/lib/redis.ts
// Singleton Redis client to prevent connection pooling issues

import { createClient } from 'redis';

type RedisClientType = ReturnType<typeof createClient>;

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    });

    // Error handler to prevent crashes
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Connect to Redis
    await client.connect();
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
