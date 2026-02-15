import { Asset, Prices } from "@/types/asset";

export function getTotalValue(assets: Asset[], prices: Prices): number {
  return assets.reduce((total, asset) => {
    return total + calculateAssetValue(asset, prices);
  }, 0);
}

export function calculateAssetValue(asset: Asset, prices: Prices): number {
  switch (asset.type) {
    case "gold":
      // Convert grams to troy ounces (31.1035 grams per oz) then multiply by price
      const purityFactor = (asset.purity ?? 24) / 24;
      return ((asset.amount * prices.gold.egp) / 31.1035) * purityFactor;

    case "silver":
      // Convert grams to troy ounces then multiply by price
      return (asset.amount * prices.silver.egp) / 31.1035;

    case "usd":
      return asset.amount * prices.usdToEgp;

    case "cash":
    default:
      return asset.amount;
  }
}
