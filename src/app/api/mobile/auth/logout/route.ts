import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  });
}
