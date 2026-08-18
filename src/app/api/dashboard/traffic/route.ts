import { NextResponse } from 'next/server';

export async function GET() {
  const trafficData = [
    { time: '00:00', safeScans: 120, threatsBlocked: 24, latency: 11 },
    { time: '03:00', safeScans: 85, threatsBlocked: 18, latency: 10 },
    { time: '06:00', safeScans: 190, threatsBlocked: 45, latency: 12 },
    { time: '09:00', safeScans: 480, threatsBlocked: 112, latency: 14 },
    { time: '12:00', safeScans: 620, threatsBlocked: 145, latency: 13 },
    { time: '15:00', safeScans: 590, threatsBlocked: 130, latency: 12 },
    { time: '18:00', safeScans: 410, threatsBlocked: 95, latency: 11 },
    { time: '21:00', safeScans: 280, threatsBlocked: 60, latency: 10 },
  ];

  return NextResponse.json({ success: true, data: trafficData });
}
