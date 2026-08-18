import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let settings = null;
    if (userId) {
      settings = await db.userSettings.findUnique({ where: { userId } });
    }
    if (!settings) {
      settings = await db.userSettings.findFirst();
    }

    return NextResponse.json(
      settings || {
        autoQuarantine: true,
        scanTimeoutSeconds: 30,
        alertEmail: 'admin@phisherman.cyber',
        customRules: JSON.stringify({ blockNewlyRegistered: true, strictSslValidation: true }),
        apiKeys: JSON.stringify({ virustotal: '', abuseipdb: '', openai: '', google_safebrowsing: '' }),
      }
    );
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: error.message || 'Error fetching settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, autoQuarantine, scanTimeoutSeconds, alertEmail, customRules, apiKeys } = body;

    let targetUserId = userId;
    if (!targetUserId) {
      const defaultUser = await db.user.findFirst();
      if (defaultUser) targetUserId = defaultUser.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updated = await db.userSettings.upsert({
      where: { userId: targetUserId },
      update: {
        autoQuarantine: autoQuarantine ?? true,
        scanTimeoutSeconds: scanTimeoutSeconds ?? 30,
        alertEmail,
        customRules: typeof customRules === 'string' ? customRules : JSON.stringify(customRules || {}),
        apiKeys: typeof apiKeys === 'string' ? apiKeys : JSON.stringify(apiKeys || {}),
      },
      create: {
        userId: targetUserId,
        autoQuarantine: autoQuarantine ?? true,
        scanTimeoutSeconds: scanTimeoutSeconds ?? 30,
        alertEmail,
        customRules: typeof customRules === 'string' ? customRules : JSON.stringify(customRules || {}),
        apiKeys: typeof apiKeys === 'string' ? apiKeys : JSON.stringify(apiKeys || {}),
      },
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings: updated });
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: error.message || 'Error updating settings' }, { status: 500 });
  }
}
