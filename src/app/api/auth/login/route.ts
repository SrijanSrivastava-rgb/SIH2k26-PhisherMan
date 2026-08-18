import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Auto-provision user account if it doesn't exist yet for smooth onboarding
      const passwordHash = await bcrypt.hash(password, 10);
      user = await db.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          passwordHash,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`,
          role: 'SOC Analyst',
          settings: {
            create: {
              autoQuarantine: true,
              scanTimeoutSeconds: 30,
            },
          },
        },
      });
    }

    const response = NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set('phisherman_token', `active_session_${user.id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
