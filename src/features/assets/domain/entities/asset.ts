export type SupportedAsset = {
  type: 'supported';
  symbol: string;
};

export type CustomAsset = {
  type?: 'custom';
  id: string;
  userId: string;
  symbol: string;
  createdAt: string;
};

export type FavoriteAsset = {
  symbol: string;
  favorited: boolean;
};

export function normalizeAssetSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export function createFavoriteAsset(symbol: string): FavoriteAsset {
  return {
    symbol: normalizeAssetSymbol(symbol),
    favorited: true,
  };
}

export function combineAssets({
  supportedSymbols,
  customAssets,
}: {
  supportedSymbols: readonly string[];
  customAssets: CustomAsset[];
}): string[] {
  const supported = new Set(supportedSymbols);
  const customSymbols = customAssets
    .map((asset) => asset.symbol)
    .filter((symbol) => !supported.has(symbol));

  return [...supportedSymbols, ...customSymbols];
}
