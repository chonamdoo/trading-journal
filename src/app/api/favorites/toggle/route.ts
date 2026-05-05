import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createAssetsCompositionRoot } from '@/features/assets/di.server';

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    let body: { symbol?: unknown };
    try {
      body = (await req.json()) as { symbol?: unknown };
    } catch {
      return NextResponse.json({ error: '잘못된 요청 본문' }, { status: 400 });
    }

    if (typeof body.symbol !== 'string') {
      return NextResponse.json({ error: '심볼이 필요합니다.' }, { status: 400 });
    }

    try {
      const result = await createAssetsCompositionRoot(supabase).toggleFavoriteAsset.execute({
        userId,
        symbol: body.symbol,
      });
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
