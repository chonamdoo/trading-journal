import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { deleteScreenshot } from '@/lib/api/screenshots';

type Params = { params: Promise<{ id: string; screenshotId: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const { screenshotId } = await params;
  return withAuth(req, async (supabase) => {
    const { searchParams } = new URL(req.url);
    const storagePath = searchParams.get('storagePath');

    if (!storagePath) {
      return NextResponse.json({ error: 'storagePath 파라미터가 필요합니다.' }, { status: 400 });
    }

    const result = await deleteScreenshot(supabase, screenshotId, storagePath);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  });
}
