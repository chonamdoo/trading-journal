import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTargets, createTarget } from '@/lib/api/targets';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const result = await getTargets(supabase, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as { label: string; amount: number };
    const result = await createTarget(supabase, userId, body.label, body.amount);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
