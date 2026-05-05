import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createAssetsCompositionRoot } from '@/features/assets/di.server';
import { mapCustomAssetToResponse } from '@/features/assets/presentation/mappers/asset-response.mapper';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const customAssets = await createAssetsCompositionRoot(supabase).listCustomAssets.execute({ userId });
      return NextResponse.json({
        success: true,
        data: customAssets.map(mapCustomAssetToResponse),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const body = await req.json() as { symbol: string };
      const customAsset = await createAssetsCompositionRoot(supabase).addCustomAsset.execute({
        userId,
        symbol: body.symbol,
      });
      return NextResponse.json(
        { success: true, data: mapCustomAssetToResponse(customAsset) },
        { status: 201 },
      );
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
