import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { deleteCustomAsset } from '@/lib/api/assets';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await deleteCustomAsset(supabase, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  });
}
