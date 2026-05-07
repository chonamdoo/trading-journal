import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getActivePlans } from '@/lib/api/plans';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const result = await getActivePlans(supabase, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}
