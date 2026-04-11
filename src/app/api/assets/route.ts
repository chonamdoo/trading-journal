import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getAllAssets, getCustomAssets } from '@/lib/api/assets';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'custom') {
      const result = await getCustomAssets(supabase, userId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: result.data });
    }

    const result = await getAllAssets(supabase, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}
