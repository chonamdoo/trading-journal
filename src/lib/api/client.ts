'use client';

import { createClient } from '@/lib/supabase/client';

export type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function refreshAuthHeader(): Promise<Record<string, string> | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.refreshSession();
  if (data.session?.access_token) {
    return { Authorization: `Bearer ${data.session.access_token}` };
  }
  return null;
}

async function readJsonBody<T>(res: Response): Promise<T | undefined> {
  if (res.status === 204) {
    return undefined;
  }

  const text = await res.text();
  if (!text) {
    return undefined;
  }

  const jsonText = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  return JSON.parse(jsonText) as T;
}

/**
 * 통합 API 호출 래퍼
 * - Supabase 세션에서 access_token 추출 → Bearer 헤더
 * - 401 시 refreshSession 후 1회 재시도
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const authHeader = await getAuthHeader();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
    ...authHeader,
  };

  try {
    let res = await fetch(path, { ...options, headers });

    if (res.status === 401) {
      const refreshed = await refreshAuthHeader();
      if (refreshed) {
        const retryHeaders = { ...headers, ...refreshed };
        res = await fetch(path, { ...options, headers: retryHeaders });
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return { success: false, error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }
    }

    const json = await readJsonBody<Record<string, unknown>>(res);
    if (!res.ok) {
      return { success: false, error: (json?.error as string) || `HTTP ${res.status}` };
    }
    return { success: true, data: json as T };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * FormData 전송용 (스크린샷 업로드)
 */
export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
): Promise<ApiResult<T>> {
  const authHeader = await getAuthHeader();

  const headers: Record<string, string> = {
    ...authHeader,
  };

  try {
    let res = await fetch(path, { method: 'POST', body: formData, headers });

    if (res.status === 401) {
      const refreshed = await refreshAuthHeader();
      if (refreshed) {
        const retryHeaders = { ...headers, ...refreshed };
        res = await fetch(path, { method: 'POST', body: formData, headers: retryHeaders });
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return { success: false, error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }
    }

    const json = await readJsonBody<Record<string, unknown>>(res);
    if (!res.ok) {
      return { success: false, error: (json?.error as string) || `HTTP ${res.status}` };
    }
    return { success: true, data: json as T };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function apiFetchBlob(path: string): Promise<ApiResult<Blob>> {
  const authHeader = await getAuthHeader();
  const headers: Record<string, string> = {
    ...authHeader,
  };

  try {
    let res = await fetch(path, { headers });

    if (res.status === 401) {
      const refreshed = await refreshAuthHeader();
      if (refreshed) {
        res = await fetch(path, { headers: { ...headers, ...refreshed } });
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return { success: false, error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }
    }

    if (!res.ok) {
      const json = await readJsonBody<Record<string, unknown>>(res);
      return { success: false, error: (json?.error as string) || `HTTP ${res.status}` };
    }

    return { success: true, data: await res.blob() };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
