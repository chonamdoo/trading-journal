import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getScreenshotBlob } from '@/lib/api/screenshots';

type Params = { params: Promise<{ id: string; screenshotId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id, screenshotId } = await params;
  return withAuth(req, async (supabase) => {
    const result = await getScreenshotBlob(supabase, id, screenshotId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return new NextResponse(result.data.blob, {
      headers: {
        'Content-Type': result.data.mimeType,
        'Cache-Control': 'private, max-age=300',
      },
    });
  });
}
