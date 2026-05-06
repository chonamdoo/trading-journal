import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getDeposits, createDeposit } from '@/lib/api/deposits';
import type { DepositInsert } from '@/lib/supabase/types';
import { isMobileCompatibilityRequest } from '@/lib/api/mobile-redirect';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const result = await getDeposits(supabase, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    if (isMobileCompatibilityRequest(req)) {
      return NextResponse.json(result.data);
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as Omit<DepositInsert, 'user_id'>;
    const result = await createDeposit(supabase, { ...body, user_id: userId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    if (isMobileCompatibilityRequest(req)) {
      return NextResponse.json(result.data, { status: 201 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
