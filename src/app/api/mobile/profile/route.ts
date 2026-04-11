import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getProfile, updateProfile } from '@/lib/api/profile';
import type { ProfileUpdate } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const result = await getProfile(supabase, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data);
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as ProfileUpdate;
    const result = await updateProfile(supabase, userId, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data);
  });
}
