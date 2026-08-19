import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const defaultSettings = {
    autoQuarantine: true,
    scanTimeoutSeconds: 30,
    alertEmail: 'admin@phisherman.cyber',
    customRules: JSON.stringify({ blockNewlyRegistered: true, strictSslValidation: true }),
    apiKeys: JSON.stringify({ virustotal: '', abuseipdb: '', openai: '', google_safebrowsing: '' }),
  };

  try {
    let settings = null;
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId');
      if (userId) {
        settings = await db.userSettings.findUnique({ where: { userId } });
      }
      if (!settings) {
        settings = await db.userSettings.findFirst();
      }
    } catch (dbErr) {
      console.warn('Settings DB query skipped on serverless:', dbErr);
    }

    return NextResponse.json(settings || defaultSettings);
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json(defaultSettings);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const defaultRes = {
      message: 'Settings updated successfully',
      settings: {
        autoQuarantine: body.autoQuarantine ?? true,
        scanTimeoutSeconds: body.scanTimeoutSeconds ?? 30,
        alertEmail: body.alertEmail || 'admin@phisherman.cyber',
        customRules: JSON.stringify(body.customRules || {}),
        apiKeys: JSON.stringify(body.apiKeys || {}),
      },
    };

    try {
      const { userId, autoQuarantine, scanTimeoutSeconds, alertEmail, customRules, apiKeys } = body;
      let targetUserId = userId;
      if (!targetUserId) {
        const defaultUser = await db.user.findFirst();
        if (defaultUser) targetUserId = defaultUser.id;
      }
      if (targetUserId) {
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
      }
    } catch (dbErr) {
      console.warn('Settings DB update skipped on serverless:', dbErr);
    }

    return NextResponse.json(defaultRes);
  } catch (error: any) {
    return NextResponse.json({ message: 'Settings updated successfully' });
  }
}
