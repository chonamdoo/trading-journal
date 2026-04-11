import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { updateDeposit, deleteDeposit } from '@/lib/api/deposits';
import type { DepositUpdate } from '@/lib/supabase/types';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const body = await req.json() as DepositUpdate;
    const result = await updateDeposit(supabase, id, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await deleteDeposit(supabase, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  });
}
