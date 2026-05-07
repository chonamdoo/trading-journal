import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { reorderTargets } from '@/lib/api/targets';

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    let body: { targetIds?: string[] };
    try {
      body = await req.json() as { targetIds?: string[] };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (
      !Array.isArray(body.targetIds) ||
      body.targetIds.some((targetId) => typeof targetId !== 'string' || targetId.length === 0)
    ) {
      return NextResponse.json({ error: 'targetIds must be an array' }, { status: 400 });
    }

    const result = await reorderTargets(supabase, body.targetIds, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: null });
  });
}
