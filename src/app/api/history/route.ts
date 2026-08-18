import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const verdict = searchParams.get('verdict');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const whereClause: any = {};
    if (verdict && verdict !== 'ALL') {
      whereClause.verdict = verdict.toUpperCase();
    }
    if (search) {
      whereClause.OR = [
        { domain: { contains: search } },
        { url: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }

    const scans = await db.scanResult.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(scans);
  } catch (error: any) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: error.message || 'Error fetching scan history' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await db.scanResult.delete({ where: { id } });
    } else {
      await db.scanResult.deleteMany({});
    }

    return NextResponse.json({ message: 'History cleared successfully' });
  } catch (error: any) {
    console.error('History DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Error deleting history' }, { status: 500 });
  }
}
