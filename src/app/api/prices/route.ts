import { NextResponse } from "next/server";

export const revalidate = 86400; // Cache the entire route for 24 hours

export async function GET() {
  try {
    const [goldRes, silverRes, fxRes] = await Promise.all([
      fetch("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": process.env.GOLD_API_KEY! },
        next: { revalidate: 86400 },
      }),
      fetch("https://www.goldapi.io/api/XAG/USD", {
        headers: { "x-access-token": process.env.GOLD_API_KEY! },
        next: { revalidate: 86400 },
      }),
      fetch("https://open.er-api.com/v6/latest/USD", {
        next: { revalidate: 86400 },
      }),
    ]);

    if (!goldRes.ok) throw new Error("Gold API failed");
    if (!silverRes.ok) throw new Error("Silver API failed");
    if (!fxRes.ok) throw new Error("FX API failed");

    const [goldData, silverData, fxData] = await Promise.all([
      goldRes.json(),
      silverRes.json(),
      fxRes.json(),
    ]);

    const usdToEgp = fxData?.rates?.EGP;
    if (!usdToEgp) throw new Error("EGP rate missing from FX response");

    const goldUSD = goldData?.price;
    const silverUSD = silverData?.price;
    if (!goldUSD || !silverUSD) throw new Error("Metal price missing");

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Live price fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch live prices" },
      { status: 500 }
    );
  }
}