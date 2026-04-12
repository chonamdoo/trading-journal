import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getReports } from '@/lib/api/reports';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get('periodType') as
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | null;
    const result = await getReports(
      supabase,
      userId,
      periodType ?? undefined,
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}
