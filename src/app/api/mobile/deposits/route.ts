import { NextRequest } from 'next/server';
import { redirectMobileApi } from '@/lib/api/mobile-redirect';

export async function GET(req: NextRequest) {
  return redirectMobileApi(req, '/api/deposits');
}

export async function POST(req: NextRequest) {
  return redirectMobileApi(req, '/api/deposits');
}
