import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readProjectFile(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

function projectPath(path: string): string {
  return resolve(root, path);
}

describe('post-refactor legacy cleanup', () => {
  it('removes unsupported Flipster runtime support', () => {
    expect(existsSync(projectPath('src/app/api/exchange/flipster/connection/route.ts'))).toBe(false);
    expect(existsSync(projectPath('src/lib/exchange/flipster.ts'))).toBe(false);

    const settingsPage = readProjectFile('src/app/(main)/settings/page.tsx');
    const clientApi = readProjectFile('src/lib/api/client-api.ts');
    const importedTrade = readProjectFile('src/features/exchange-import/domain/entities/imported-trade.ts');

    expect(settingsPage).not.toMatch(/flipster|Flipster/);
    expect(clientApi).not.toMatch(/flipster|Flipster/);
    expect(importedTrade).not.toContain("'flipster'");
  });

  it('removes legacy helper files after feature boundary migration', () => {
    for (const path of [
      'src/lib/api/assets.ts',
      'src/lib/api/favorites.ts',
      'src/lib/api/profile.ts',
      'src/lib/api/reports.ts',
      'src/lib/api/targets.ts',
    ]) {
      expect(existsSync(projectPath(path))).toBe(false);
    }
  });

  it('removes mobile compatibility API surface', () => {
    expect(existsSync(projectPath('src/app/api/mobile'))).toBe(false);
    expect(existsSync(projectPath('src/lib/api/mobile-auth.ts'))).toBe(false);
    expect(existsSync(projectPath('src/lib/api/mobile-redirect.ts'))).toBe(false);

    const middleware = readProjectFile('src/lib/supabase/middleware.ts');
    expect(middleware).not.toContain('/api/mobile');
  });
});
