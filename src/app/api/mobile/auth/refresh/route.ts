import { NextRequest, NextResponse } from 'next/server';
import { createMobileClient } from '@/lib/supabase/mobile-server';

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json() as { refresh_token: string };

    if (!refresh_token) {
      return NextResponse.json({ error: 'refresh_token required' }, { status: 400 });
    }

    const supabase = createMobileClient('');
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message ?? 'Refresh failed' }, { status: 401 });
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
