export interface ICurrency {
  name: string;
  code: string;
  symbol: string;

  timestamp?: string;
  exchange_rate?: number;
}
