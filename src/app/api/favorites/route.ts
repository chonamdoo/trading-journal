import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createAssetsCompositionRoot } from '@/features/assets/di.server';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const favorites = await createAssetsCompositionRoot(supabase).listFavoriteAssets.execute({ userId });
      return NextResponse.json({ success: true, data: favorites });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
