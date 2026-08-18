import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await db.threatCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const pings = await db.threatPing.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      campaigns,
      pings,
    });
  } catch (error: any) {
    console.error('Threats API error:', error);
    return NextResponse.json({ error: error.message || 'Error fetching threat intel' }, { status: 500 });
  }
}
