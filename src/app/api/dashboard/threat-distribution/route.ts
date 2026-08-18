import { NextResponse } from 'next/server';

export async function GET() {
  const distributionData = [
    { category: 'Credential Harvesting', count: 485, percentage: 42, color: '#FF0055' },
    { category: 'Typo-Squatting', count: 312, percentage: 27, color: '#FF5500' },
    { category: 'Zero-Day Exploits', count: 184, percentage: 16, color: '#AA00FF' },
    { category: 'DNS Spoofing', count: 172, percentage: 15, color: '#00F0FF' },
  ];

  return NextResponse.json({ success: true, data: distributionData });
}
