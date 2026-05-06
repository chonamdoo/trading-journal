import { NextRequest } from 'next/server';
import { redirectMobileApi } from '@/lib/api/mobile-redirect';

export async function GET(req: NextRequest) {
  return redirectMobileApi(req, '/api/profile');
}

export async function PUT(req: NextRequest) {
  return redirectMobileApi(req, '/api/profile');
}
