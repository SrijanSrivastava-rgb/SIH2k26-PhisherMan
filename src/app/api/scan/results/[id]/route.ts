import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const record = await db.scanResult.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: 'Scan result not found.' }, { status: 404 });
    }

    const formatted = {
      id: record.id,
      url: record.url,
      domain: record.domain,
      ipAddress: record.ipAddress,
      status: record.status,
      overallScore: record.overallScore,
      verdict: record.verdict,
      dnsData: JSON.parse(record.dnsData || '{}'),
      whoisData: JSON.parse(record.whoisData || '{}'),
      sslData: JSON.parse(record.sslData || '{}'),
      domData: JSON.parse(record.domData || '{}'),
      visualData: JSON.parse(record.visualData || '{}'),
      aiExplanation: record.aiExplanation,
      stepTimings: JSON.parse(record.stepTimings || '[]'),
      createdAt: record.createdAt,
    };

    return NextResponse.json({ success: true, result: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve scan results.' }, { status: 500 });
  }
}
