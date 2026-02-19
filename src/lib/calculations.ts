import { Asset, Prices } from "@/types/asset";

// Helper function to calculate months elapsed from start date (optionally until end date)
function calculateMonthsElapsed(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const diffMs = end.getTime() - start.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44); // Average month = 30.44 days

  return Math.max(0, diffMonths);
}

// Helper to calculate interest accumulation (simple or compound)
function calculateInterestAccumulation(
  principal: number,
  rate: number,
  completeMonths: number,
  isSimple: boolean
): number {
  const monthlyRate = rate / 100 / 12;
  const monthlyInterest = principal * monthlyRate;

  return isSimple
    ? principal + (monthlyInterest * completeMonths)
    : principal * Math.pow(1 + monthlyRate, completeMonths);
}

// Calculate rent account value (from start to today)
function calculateRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) {
    return 0;
  }

  const monthsElapsed = calculateMonthsElapsed(asset.startDate);
  const completeMonths = Math.floor(monthsElapsed);
  return asset.monthlyRent * completeMonths;
}

// Calculate projected total value for rent (from start to end date)
export function calculateProjectedRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) {
    return 0;
  }

  const monthsElapsed = calculateMonthsElapsed(asset.startDate, asset.endDate);
  const completeMonths = Math.floor(monthsElapsed);
  return asset.monthlyRent * completeMonths;
}

// Calculate interest account value (from start to today)
function calculateInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }

  const monthsElapsed = calculateMonthsElapsed(asset.startDate);
  const completeMonths = Math.floor(monthsElapsed);
  const isSimple = asset.interestType === "simple";

  return calculateInterestAccumulation(asset.principal, asset.interestRate, completeMonths, isSimple);
}

// Calculate projected total value for interest (from start to end date)
export function calculateProjectedInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }

  const monthsElapsed = calculateMonthsElapsed(asset.startDate, asset.endDate);
  const completeMonths = Math.floor(monthsElapsed);
  const isSimple = asset.interestType === "simple";

  return calculateInterestAccumulation(asset.principal, asset.interestRate, completeMonths, isSimple);
}

export function getTotalValue(assets: Asset[], prices: Prices): number {
  return assets.reduce((total, asset) => {
    return total + calculateAssetValue(asset, prices);
  }, 0);
}

export function calculateAssetValue(asset: Asset, prices: Prices): number {
  switch (asset.type) {
    case "rent":
      return calculateRentValue(asset);

    case "interest":
      return calculateInterestValue(asset);

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
