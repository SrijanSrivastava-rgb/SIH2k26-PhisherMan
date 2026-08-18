import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.scanResult.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Scan history entry deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete entry.' }, { status: 500 });
  }
}
