import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createAssetsCompositionRoot } from '@/features/assets/di.server';
import { DomainValidationError } from '@/features/assets/domain/errors/domain-validation.error';

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
      if (err instanceof DomainValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      console.error('Failed to toggle favorite asset', err);
      return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
  });
}
