import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { GET, PUT } from '@/app/api/mobile/profile/route';

describe('/api/mobile/profile compatibility redirect', () => {
  it('redirects profile reads and updates to /api/profile', async () => {
    const getResponse = await GET(new NextRequest('http://localhost/api/mobile/profile'));
    const putResponse = await PUT(
      new NextRequest('http://localhost/api/mobile/profile', { method: 'PUT' }),
    );

    expect(getResponse.status).toBe(308);
    expect(getResponse.headers.get('location')).toBe('http://localhost/api/profile?__mobile_compat=1');
    expect(putResponse.status).toBe(308);
    expect(putResponse.headers.get('location')).toBe('http://localhost/api/profile?__mobile_compat=1');
  });
});
