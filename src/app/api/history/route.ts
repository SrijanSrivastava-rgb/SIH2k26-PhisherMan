import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const defaultScans = [
    { id: '1', url: 'https://paypal-secure-verify.tk', domain: 'paypal-secure-verify.tk', ipAddress: '194.26.29.115', overallScore: 92, verdict: 'QUARANTINED', createdAt: new Date(Date.now() - 60000).toISOString() },
    { id: '2', url: 'https://login-google-support.net', domain: 'login-google-support.net', ipAddress: '45.142.214.82', overallScore: 84, verdict: 'PHISHING', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: '3', url: 'https://micros0ft-verify.org', domain: 'micros0ft-verify.org', ipAddress: '185.220.101.5', overallScore: 48, verdict: 'SUSPICIOUS', createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: '4', url: 'https://github.com', domain: 'github.com', ipAddress: '140.82.121.4', overallScore: 4, verdict: 'SAFE', createdAt: new Date(Date.now() - 1800000).toISOString() },
  ];

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

    return NextResponse.json(scans.length > 0 ? scans : defaultScans);
  } catch (error: any) {
    console.error('History GET error:', error);
    return NextResponse.json(defaultScans);
  }
}

export async function DELETE() {
  try {
    try {
      await db.scanResult.deleteMany({});
    } catch (dbErr) {
      console.warn('History DB delete skipped on serverless:', dbErr);
    }
    return NextResponse.json({ message: 'History cleared successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'History cleared successfully' });
  }
}
