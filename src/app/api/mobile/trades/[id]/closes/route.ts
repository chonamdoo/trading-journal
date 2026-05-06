import { NextRequest } from 'next/server';
import { redirectMobileApi } from '@/lib/api/mobile-redirect';

type Params = { params: Promise<{ id: string }> };

async function redirectToTradeCloses(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return redirectMobileApi(req, `/api/trades/${id}/closes`);
}

export async function GET(req: NextRequest, context: Params) {
  return redirectToTradeCloses(req, context);
}

export async function POST(req: NextRequest, context: Params) {
  return redirectToTradeCloses(req, context);
}
