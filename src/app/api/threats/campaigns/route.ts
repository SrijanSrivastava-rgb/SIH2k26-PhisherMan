import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rawCampaigns = await db.threatCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = rawCampaigns.map((c) => ({
      id: c.id,
      name: c.name,
      target: c.target,
      threatLevel: c.threatLevel,
      description: c.description,
      status: c.status,
      maliciousDomains: JSON.parse(c.maliciousDomains || '[]'),
      maliciousIPs: JSON.parse(c.maliciousIPs || '[]'),
      iocs: JSON.parse(c.iocs || '[]'),
      originLat: c.originLat,
      originLng: c.originLng,
      targetLat: c.targetLat,
      targetLng: c.targetLng,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ success: true, campaigns: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch threat campaigns.' }, { status: 500 });
  }
}
