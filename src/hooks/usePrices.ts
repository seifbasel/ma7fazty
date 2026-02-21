import { useEffect, useState } from "react";
import { Prices } from "@/types/asset";

const DEFAULT_PRICES: Prices = {
  gold: { usd: 0, egp: 0, change: 0 },
  silver: { usd: 0, egp: 0, change: 0 },
  usdToEgp: 0,
};

function isValidPrices(data: unknown): data is Prices {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof (d.gold as Record<string, unknown>)?.egp === "number" &&
    typeof (d.silver as Record<string, unknown>)?.egp === "number" &&
    typeof d.usdToEgp === "number"
  );
}

export function usePrices() {
  const [prices, setPrices] = useState<Prices>(DEFAULT_PRICES);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await fetch("/api/prices");
      const data = await res.json();
      if (isValidPrices(data)) {
        setPrices(data);
      } else {
        console.error("Invalid prices response:", data);
      }
    } catch (err) {
      console.error("Failed to fetch prices:", err);
    }
  };

  return prices;
}