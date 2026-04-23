import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { setFavorite } from '@/lib/api/favorites';

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    let body: { symbol?: unknown; favorited?: unknown };
    try {
      body = (await req.json()) as { symbol?: unknown; favorited?: unknown };
    } catch {
      return NextResponse.json({ error: '잘못된 요청 본문' }, { status: 400 });
    }

    if (typeof body.symbol !== 'string') {
      return NextResponse.json({ error: '심볼이 필요합니다.' }, { status: 400 });
    }
    if (typeof body.favorited !== 'boolean') {
      return NextResponse.json({ error: 'favorited 값(boolean)이 필요합니다.' }, { status: 400 });
    }

    const result = await setFavorite(supabase, userId, body.symbol, body.favorited);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}
