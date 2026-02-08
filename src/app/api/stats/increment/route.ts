// src/app/api/stats/increment/route.ts

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const { event } = await request.json();

    // Validate event type
    if (!['visits', 'shares', 'pomodoros'].includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Use shared Redis client (no connect/quit needed)
    const client = await getRedisClient();

    // Increment total counter
    const newValue = await client.incr(`total_${event}`);

    // Increment monthly bucket (e.g. visits:2026-02)
    const month = new Date().toISOString().slice(0, 7);
    await client.incr(`${event}:${month}`);

    return NextResponse.json({
      event,
      total: newValue,
    });
  } catch (error) {
    console.error('Error incrementing stats:', error);
    return NextResponse.json(
      { error: 'Failed to increment stats' },
      { status: 500 }
    );
  }
}
