export type ScaleInType = 'averaging-down' | 'pyramiding';

export interface ScaleIn {
  id: string;
  tradeId: string;
  userId?: string;
  entryPrice: number;
  margin: number;
  quantity?: number | null;
  entryDatetime: string;
  type: ScaleInType;
  note?: string | null;
  createdAt?: string;
}
