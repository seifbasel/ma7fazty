import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(
      "https://goldpricez.com/api/rates/currency/egp/measure/ounce/metal/all",
      {
        headers: { "X-API-KEY": process.env.GOLDPRICEZ_API_KEY! },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      throw new Error(`GoldPriceZ responded ${res.status}: ${await res.text()}`);
    }

    // The API returns a JSON-encoded string — parse it twice
    const raw = await res.text();
    const d = JSON.parse(typeof JSON.parse(raw) === "string" ? JSON.parse(raw) : raw);

    const goldUSD: number  = parseFloat(d.ounce_price_usd);
    const goldEGP: number  = parseFloat(d.ounce_in_egp);
    const usdToEgp: number = parseFloat(d.usd_to_egp);
    const silverEGP: number = parseFloat(d.silver_ounce_in_egp);
    const silverUSD: number = usdToEgp > 0 ? silverEGP / usdToEgp : 0;

    if (!goldUSD || !goldEGP || !usdToEgp || !silverEGP) {
      throw new Error(`Parsed values invalid: goldUSD=${goldUSD} goldEGP=${goldEGP} usdToEgp=${usdToEgp} silverEGP=${silverEGP}`);
    }

    return NextResponse.json({
      gold:   { usd: goldUSD,   egp: goldEGP,   change: 0 },
      silver: { usd: silverUSD, egp: silverEGP, change: 0 },
      usdToEgp,
    });
  } catch (error) {
    console.error("GoldPriceZ fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch live prices" }, { status: 500 });
  }
}