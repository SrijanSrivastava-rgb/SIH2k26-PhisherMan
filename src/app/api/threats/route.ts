import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const defaultCampaigns = [
    { name: 'PayFlow Recovery Wave', brand: 'PayPal', domains: 14, sev: 'high', seen: '2h ago' },
    { name: 'Google Account Lockout', brand: 'Google', domains: 9, sev: 'high', seen: '6h ago' },
    { name: 'Prime Billing Refresh', brand: 'Amazon', domains: 11, sev: 'high', seen: '9h ago' },
    { name: 'MFA Reset Notice', brand: 'Microsoft', domains: 6, sev: 'medium', seen: '13h ago' },
    { name: 'Card Verification Hold', brand: 'Chase', domains: 5, sev: 'medium', seen: '15h ago' },
    { name: 'Subscription Renewal', brand: 'Netflix', domains: 3, sev: 'low', seen: '22h ago' },
    { name: 'Device Sign-in Alert', brand: 'Apple', domains: 4, sev: 'medium', seen: '1d ago' },
  ];

  try {
    let campaigns: any[] = [];
    let pings: any[] = [];

    try {
      campaigns = await db.threatCampaign.findMany({
        orderBy: { createdAt: 'desc' },
      });
      pings = await db.threatPing.findMany({
        orderBy: { timestamp: 'desc' },
        take: 20,
      });
    } catch (dbErr) {
      console.warn('Threats DB query skipped on serverless:', dbErr);
    }

    return NextResponse.json({
      campaigns: campaigns.length > 0 ? campaigns : defaultCampaigns,
      pings,
    });
  } catch (error: any) {
    console.error('Threats API error:', error);
    return NextResponse.json({
      campaigns: defaultCampaigns,
      pings: [],
    });
  }
}
