import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getScreenshots, uploadScreenshot } from '@/lib/api/screenshots';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await getScreenshots(supabase, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase, userId) => {
    const formData = await req.formData();
    const file = formData.get('file');
    const sortOrder = Number(formData.get('sortOrder') ?? 0);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const result = await uploadScreenshot(supabase, file, userId, id, sortOrder);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
