export interface Asset {
  id: number;
  name: string;
  type: "cash" | "usd" | "gold" | "silver";
  amount: number;
  unit: string;
  purity?: 18 | 21 | 22 | 24;
  createdAt: string;
}


export interface Price {
  usd: number;
  egp: number;
  change: number;
}

export interface Prices {
  gold: Price;
  silver: Price;
  usdToEgp: number;
}
