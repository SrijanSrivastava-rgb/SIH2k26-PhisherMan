import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const records = await db.scanResult.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      url: r.url,
      domain: r.domain,
      verdict: r.verdict,
      overallScore: r.overallScore,
      ipAddress: r.ipAddress || '194.26.29.110',
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ success: true, threats: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch recent threats.' }, { status: 500 });
  }
}
