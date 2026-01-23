// src/app/api/stats/get/route.ts

import { createClient } from 'redis';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  try {
    await client.connect();

    const visits = parseInt((await client.get('total_visits')) || '0');
    const shares = parseInt((await client.get('total_shares')) || '0');
    const pomodoros = parseInt((await client.get('total_pomodoros')) || '0');

    await client.quit();

    return NextResponse.json({
      visits,
      shares,
      pomodoros,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    await client.quit().catch(() => {});
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
