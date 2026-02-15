import { useEffect, useState } from "react";
import { Prices } from "@/types/asset";

export function usePrices() {
  const [prices, setPrices] = useState<Prices>({
    gold: { usd: 0, egp: 0, change: 0 },
    silver: { usd: 0, egp: 0, change: 0 },
    usdToEgp: 0,
  });

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await fetch("/api/prices");
      const data = await res.json();
      setPrices(data);
    } catch (err) {
      console.error(err);
    }
  };

  return prices;
}
