import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withRateLimit } from '@/lib/api/auth';

/**
 * POST /api/mobile/auth/google
 *
 * Google ID Token으로 Supabase 세션을 교환한다.
 * 모바일 앱에서 Google One Tap으로 받은 ID Token을 전달받아
 * Supabase Auth의 signInWithIdToken을 호출한다.
 */
export async function POST(req: NextRequest) {
  try {
    const limited = withRateLimit(req);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) } }
      );
    }

    const { id_token } = await req.json() as { id_token: string };

    if (!id_token) {
      return NextResponse.json({ error: 'id_token required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message ?? 'Google sign-in failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
