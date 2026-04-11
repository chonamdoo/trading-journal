import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getCustomAssets, addCustomAsset } from '@/lib/api/assets';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const result = await getCustomAssets(supabase, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as { symbol: string };
    const result = await addCustomAsset(supabase, userId, body.symbol);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
