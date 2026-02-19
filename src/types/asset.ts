export interface Asset {
  id: number;
  name: string;
  type: "cash" | "usd" | "gold" | "silver" | "rent" | "interest";
  amount: number;
  unit: string;
  purity?: 18 | 21 | 22 | 24;
  createdAt: string;

  // Rent-specific fields
  monthlyRent?: number;
  startDate?: string;
  endDate?: string;

  // Interest-specific fields
  principal?: number;
  interestRate?: number;
  interestType?: "simple" | "compound";
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
