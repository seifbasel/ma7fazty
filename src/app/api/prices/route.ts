import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch Gold
    const goldRes = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY!,
      },
      next: { revalidate: 300 },
    });

    // Fetch Silver
    const silverRes = await fetch("https://www.goldapi.io/api/XAG/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY!,
      },
      next: { revalidate: 300 },
    });

    // Fetch USD → EGP
    const fxRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 300 },
    });

    if (!goldRes.ok) {
      throw new Error("Gold API failed");
    }

    if (!silverRes.ok) {
      throw new Error("Silver API failed");
    }

    if (!fxRes.ok) {
      throw new Error("FX API failed");
    }

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();
    const fxData = await fxRes.json();

    const usdToEgp = fxData?.rates?.EGP;

    if (!usdToEgp) {
      throw new Error("EGP rate missing from FX response");
    }

    const goldUSD = goldData?.price;
    const silverUSD = silverData?.price;

    if (!goldUSD || !silverUSD) {
      throw new Error("Metal price missing");
    }

    const prices = {
      gold: {
        usd: goldUSD,
        egp: goldUSD * usdToEgp,
        change: goldData?.ch ?? 0,
      },
      silver: {
        usd: silverUSD,
        egp: silverUSD * usdToEgp,
        change: silverData?.ch ?? 0,
      },
      usdToEgp,
    };

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Live price fetch failed:", error);

    return NextResponse.json({
      gold: { usd: 5000, egp: 250000, change: 0 },
      silver: { usd: 100, egp: 5000, change: 0 },
      usdToEgp: 49,
    });
  }
}
