import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createAssetsCompositionRoot } from '@/features/assets/di.server';
import { mapCustomAssetToResponse } from '@/features/assets/presentation/mappers/asset-response.mapper';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    try {
      const assets = createAssetsCompositionRoot(supabase);

      if (type === 'custom') {
        const customAssets = await assets.listCustomAssets.execute({ userId });
        return NextResponse.json({
          success: true,
          data: customAssets.map(mapCustomAssetToResponse),
        });
      }

      const allAssets = await assets.listAllAssets.execute({ userId });
      return NextResponse.json({ success: true, data: allAssets });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
