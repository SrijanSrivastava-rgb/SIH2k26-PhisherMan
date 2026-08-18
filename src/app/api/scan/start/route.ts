import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { runSecurityScan } from '@/lib/scanner/engine';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required for analysis.' }, { status: 400 });
    }

    // Run the security scanning engine pipeline
    const scanResult = await runSecurityScan(url);

    // Save scan result to Database
    const savedRecord = await db.scanResult.create({
      data: {
        userId: user?.id || null,
        url: scanResult.url,
        domain: scanResult.domain,
        ipAddress: scanResult.ipAddress,
        status: 'COMPLETED',
        overallScore: scanResult.overallScore,
        verdict: scanResult.verdict,
        dnsData: JSON.stringify(scanResult.dnsData),
        whoisData: JSON.stringify(scanResult.whoisData),
        sslData: JSON.stringify(scanResult.sslData),
        domData: JSON.stringify(scanResult.domData),
        visualData: JSON.stringify(scanResult.visualData),
        aiExplanation: scanResult.aiExplanation,
        stepTimings: JSON.stringify(scanResult.stepTimings),
      },
    });

    return NextResponse.json({
      success: true,
      id: savedRecord.id,
      scan: {
        id: savedRecord.id,
        ...scanResult,
        createdAt: savedRecord.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Scan execution failed.' }, { status: 500 });
  }
}
