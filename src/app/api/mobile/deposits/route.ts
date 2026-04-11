import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getDeposits, createDeposit } from '@/lib/api/deposits';
import type { DepositInsert } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const result = await getDeposits(supabase, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as Omit<DepositInsert, 'user_id'>;
    const result = await createDeposit(supabase, { ...body, user_id: userId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  });
}
