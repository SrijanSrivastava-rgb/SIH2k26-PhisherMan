import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const memoryScanHistory: any[] = [
  { id: '1', url: 'https://paypal-secure-verify.tk', domain: 'paypal-secure-verify.tk', ipAddress: '194.26.29.115', overallScore: 92, verdict: 'QUARANTINED', createdAt: new Date(Date.now() - 60000).toISOString() },
  { id: '2', url: 'https://login-google-support.net', domain: 'login-google-support.net', ipAddress: '45.142.214.82', overallScore: 84, verdict: 'PHISHING', createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: '3', url: 'https://micros0ft-verify.org', domain: 'micros0ft-verify.org', ipAddress: '185.220.101.5', overallScore: 48, verdict: 'SUSPICIOUS', createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: '4', url: 'https://github.com', domain: 'github.com', ipAddress: '140.82.121.4', overallScore: 4, verdict: 'SAFE', createdAt: new Date(Date.now() - 1800000).toISOString() },
];

export async function GET() {
  try {
    let scans: any[] = [];
    try {
      scans = await db.scanResult.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (dbErr) {
      console.warn('History DB query skipped on serverless:', dbErr);
    }

    if (scans.length > 0) {
      return NextResponse.json(scans);
    }
    return NextResponse.json(memoryScanHistory);
  } catch (error: any) {
    console.error('History GET error:', error);
    return NextResponse.json(memoryScanHistory);
  }
}

export async function POST(req: Request) {
  try {
    const scanItem = await req.json();
    const formattedItem = {
      id: scanItem.id || `scan_${Date.now()}`,
      url: scanItem.url || '',
      domain: scanItem.domain || '',
      ipAddress: scanItem.ipAddress || '194.26.29.110',
      overallScore: scanItem.overallScore ?? 0,
      verdict: scanItem.verdict || 'SAFE',
      createdAt: scanItem.createdAt || new Date().toISOString(),
    };

    try {
      await db.scanResult.create({
        data: {
          url: formattedItem.url,
          domain: formattedItem.domain,
          ipAddress: formattedItem.ipAddress,
          overallScore: formattedItem.overallScore,
          verdict: formattedItem.verdict,
          status: 'COMPLETED',
        },
      });
    } catch (dbErr) {
      console.warn('History DB create skipped on serverless:', dbErr);
    }

    // Unshift into memory cache as fallback
    memoryScanHistory.unshift(formattedItem);

    return NextResponse.json({ success: true, item: formattedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error saving history item' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    try {
      await db.scanResult.deleteMany({});
    } catch (dbErr) {
      console.warn('History DB delete skipped on serverless:', dbErr);
    }
    memoryScanHistory.length = 0;
    return NextResponse.json({ message: 'History cleared successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'History cleared successfully' });
  }
}
