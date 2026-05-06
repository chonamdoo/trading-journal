import { NextRequest } from 'next/server';
import { redirectMobileApi } from '@/lib/api/mobile-redirect';

type Params = { params: Promise<{ id: string }> };

async function redirectToTrade(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return redirectMobileApi(req, `/api/trades/${id}`);
}

export async function GET(req: NextRequest, context: Params) {
  return redirectToTrade(req, context);
}

export async function PUT(req: NextRequest, context: Params) {
  return redirectToTrade(req, context);
}

export async function DELETE(req: NextRequest, context: Params) {
  return redirectToTrade(req, context);
}
