import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { RATE_LIMITS } from '@/lib/api/rate-limit';
import { encryptSecret } from '@/lib/exchange/crypto';
import { verifyOkxReadConnection } from '@/lib/exchange/okx';
import type { ExchangeConnectionInsert, Json } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

interface ConnectionRequestBody {
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  label?: string;
}

function sanitizeLabel(label: unknown): string | null {
  if (typeof label !== 'string') return null;
  const trimmed = label.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 80);
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase) => {
    const { data, error } = await supabase
      .from('exchange_connections')
      .select('id, exchange, label, permissions_verified, is_active, last_synced_at, created_at, updated_at')
      .eq('exchange', 'okx')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: '거래소 연결 정보를 불러오지 못했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  }, RATE_LIMITS.exchange);
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as ConnectionRequestBody;
    const apiKey = body.apiKey?.trim() ?? '';
    const apiSecret = body.apiSecret?.trim() ?? '';
    const passphrase = body.passphrase?.trim() ?? '';

    if (apiKey.length < 8 || apiSecret.length < 16 || passphrase.length < 1) {
      return NextResponse.json({ error: '유효한 OKX API Key, Secret, Passphrase를 입력하세요.' }, { status: 400 });
    }

    let permissionCheck;
    try {
      permissionCheck = await verifyOkxReadConnection(apiKey, apiSecret, passphrase);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OKX API 키 검증에 실패했습니다.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const payload: ExchangeConnectionInsert = {
      user_id: userId,
      exchange: 'okx',
      label: sanitizeLabel(body.label),
      api_key_encrypted: encryptSecret(apiKey, { userId, exchange: 'okx', field: 'api_key' }) as unknown as Json,
      api_secret_encrypted: encryptSecret(apiSecret, { userId, exchange: 'okx', field: 'api_secret' }) as unknown as Json,
      passphrase_encrypted: encryptSecret(passphrase, { userId, exchange: 'okx', field: 'passphrase' }) as unknown as Json,
      permissions_verified: permissionCheck.canRead,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('exchange_connections')
      .upsert(payload, { onConflict: 'user_id,exchange' })
      .select('id, exchange, label, permissions_verified, is_active, last_synced_at, created_at, updated_at')
      .single();

    if (error) {
      console.error('OKX exchange connection save failed', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: '거래소 연결 정보를 저장하지 못했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        permissions: permissionCheck,
      },
    }, { status: 201 });
  }, RATE_LIMITS.exchange);
}

export async function DELETE(req: NextRequest) {
  return withAuth(req, async (supabase) => {
    const { error } = await supabase
      .from('exchange_connections')
      .delete()
      .eq('exchange', 'okx');

    if (error) {
      return NextResponse.json({ error: '거래소 연결 정보를 삭제하지 못했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }, RATE_LIMITS.exchange);
}
