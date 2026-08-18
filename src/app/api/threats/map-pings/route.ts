import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let pings = await db.threatPing.findMany({
      take: 30,
      orderBy: { timestamp: 'desc' },
    });

    if (pings.length === 0) {
      pings = [
        {
          id: 'ping-1',
          sourceIp: '194.26.29.110',
          targetIp: '54.239.28.85',
          sourceCountry: 'Russia (RU)',
          targetCountry: 'United States (US)',
          sourceLat: 55.7558,
          sourceLng: 37.6173,
          targetLat: 38.8951,
          targetLng: -77.0364,
          threatType: 'PayPal Credential Harvester',
          severity: 'CRITICAL',
          timestamp: new Date(),
        },
        {
          id: 'ping-2',
          sourceIp: '45.142.214.7',
          targetIp: '13.107.42.14',
          sourceCountry: 'Romania (RO)',
          targetCountry: 'United Kingdom (GB)',
          sourceLat: 44.4323,
          sourceLng: 26.1063,
          targetLat: 51.5074,
          targetLng: -0.1278,
          threatType: 'Microsoft 365 OAuth Phish',
          severity: 'HIGH',
          timestamp: new Date(),
        },
        {
          id: 'ping-3',
          sourceIp: '185.220.101.5',
          targetIp: '104.16.123.96',
          sourceCountry: 'Netherlands (NL)',
          targetCountry: 'India (IN)',
          sourceLat: 52.3676,
          sourceLng: 4.9041,
          targetLat: 28.6139,
          targetLng: 77.209,
          threatType: 'HDFC Bank Typo-Squatting',
          severity: 'CRITICAL',
          timestamp: new Date(),
        },
        {
          id: 'ping-4',
          sourceIp: '103.251.167.2',
          targetIp: '142.250.190.46',
          sourceCountry: 'Vietnam (VN)',
          targetCountry: 'Japan (JP)',
          sourceLat: 21.0285,
          sourceLng: 105.8542,
          targetLat: 35.6762,
          targetLng: 139.6503,
          threatType: 'Binance Session Hijacker',
          severity: 'HIGH',
          timestamp: new Date(),
        },
      ] as any;
    }

    return NextResponse.json({ success: true, pings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch threat map pings.' }, { status: 500 });
  }
}
