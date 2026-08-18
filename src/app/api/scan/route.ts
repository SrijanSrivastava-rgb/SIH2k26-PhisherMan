import { NextResponse } from 'next/server';
import { executeScan } from '@/lib/scanEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, userId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL parameter is required.' }, { status: 400 });
    }

    const result = await executeScan(url, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Scan API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
