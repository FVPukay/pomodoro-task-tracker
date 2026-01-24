// src/app/api/stats/reset/route.ts
// TEMPORARY ENDPOINT - Delete after use

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    // Simple secret key protection
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Secret key - change this to something secure
    const RESET_SECRET = 'pomodoro-reset-2026';

    if (key !== RESET_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the shared Redis client
    const client = await getRedisClient();

    // Reset all counters to 0
    await client.set('total_visits', 0);
    await client.set('total_shares', 0);
    await client.set('total_pomodoros', 0);

    return NextResponse.json({
      success: true,
      message: 'All stats reset to 0',
      visits: 0,
      shares: 0,
      pomodoros: 0,
    });
  } catch (error) {
    console.error('Error resetting stats:', error);
    return NextResponse.json(
      { error: 'Failed to reset stats' },
      { status: 500 }
    );
  }
}
