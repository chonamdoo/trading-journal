import { NextRequest, NextResponse } from 'next/server';
import { createMobileClient } from '@/lib/supabase/mobile-server';
import { withRateLimit } from '@/lib/api/auth';

export async function POST(req: NextRequest) {
  try {
    const limited = withRateLimit(req);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) } }
      );
    }

    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 });
    }

    const supabase = createMobileClient('');
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      access_token: data.session?.access_token ?? null,
      refresh_token: data.session?.refresh_token ?? null,
      expires_at: data.session?.expires_at ?? null,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
