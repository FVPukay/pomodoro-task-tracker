// src/app/api/stats/increment/route.ts

import { createClient } from 'redis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  try {
    const { event } = await request.json();

    // Validate event type
    if (!['visits', 'shares', 'pomodoros'].includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    await client.connect();

    // Increment counter
    const newValue = await client.incr(`total_${event}`);

    await client.quit();

    return NextResponse.json({
      event,
      total: newValue,
    });
  } catch (error) {
    console.error('Error incrementing stats:', error);
    await client.quit().catch(() => {});
    return NextResponse.json(
      { error: 'Failed to increment stats' },
      { status: 500 }
    );
  }
}
