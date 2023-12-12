export interface ICurrency {
  name: string;
  name_plural: string;
  code: string;
  symbol: string;

  timestamp?: string;
  exchange_rate?: number;
}
