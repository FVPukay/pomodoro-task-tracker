// src/app/api/stats/get/route.ts

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    // Use shared Redis client (no connect/quit needed)
    const client = await getRedisClient();

    const visits = parseInt((await client.get('total_visits')) || '0');
    const shares = parseInt((await client.get('total_shares')) || '0');
    const pomodoros = parseInt((await client.get('total_pomodoros')) || '0');

    return NextResponse.json({
      visits,
      shares,
      pomodoros,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
