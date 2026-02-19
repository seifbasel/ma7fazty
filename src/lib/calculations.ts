import { Asset, Prices } from "@/types/asset";

// Helper function to calculate months elapsed from start date (optionally until end date)
function calculateMonthsElapsed(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  // If end date is in the future but before today, use end date
  // If end date is today or past, use end date
  // If no end date, use today
  const diffMs = end.getTime() - start.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44); // Average month = 30.44 days

  return Math.max(0, diffMonths);
}

// Calculate rent account value (from start to today)
function calculateRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) {
    return 0;
  }

  // Calculate accumulated rent from start date to today (complete months only)
  const monthsElapsed = calculateMonthsElapsed(asset.startDate);
  const completeMonths = Math.floor(monthsElapsed);
  const accumulatedRent = asset.monthlyRent * completeMonths;

  return accumulatedRent;
}

// Calculate projected total value for rent (from start to end date)
export function calculateProjectedRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) {
    return 0;
  }

  // If end date exists, calculate total from start to end
  // Otherwise, calculate from start to today
  const monthsElapsed = calculateMonthsElapsed(asset.startDate, asset.endDate);
  const completeMonths = Math.floor(monthsElapsed);
  const projectedRent = asset.monthlyRent * completeMonths;

  return projectedRent;
}

// Calculate projected total value for interest (from start to end date)
export function calculateProjectedInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }

  const monthsElapsed = calculateMonthsElapsed(asset.startDate, asset.endDate);
  const completeMonths = Math.floor(monthsElapsed);
  const rateDecimal = asset.interestRate / 100;
  const monthlyInterest = asset.principal * rateDecimal / 12;

  let projectedValue: number;

  if (asset.interestType === "simple") {
    // Simple interest: Principal + (monthly interest × complete months)
    projectedValue = asset.principal + (monthlyInterest * completeMonths);
  } else {
    // Compound interest: Principal × (1 + monthly rate)^complete months
    const monthRate = rateDecimal / 12;
    projectedValue = asset.principal * Math.pow(1 + monthRate, completeMonths);
  }

  return projectedValue;
}

// Calculate interest account value (from start to today)
function calculateInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }

  const monthsElapsed = calculateMonthsElapsed(asset.startDate);
  const completeMonths = Math.floor(monthsElapsed);
  const rateDecimal = asset.interestRate / 100;
  const monthlyInterest = asset.principal * rateDecimal / 12;

  let accumulatedValue: number;

  if (asset.interestType === "simple") {
    // Simple interest: Principal + (monthly interest × complete months)
    accumulatedValue = asset.principal + (monthlyInterest * completeMonths);
  } else {
    // Compound interest: Principal × (1 + monthly rate)^complete months
    const monthRate = rateDecimal / 12;
    accumulatedValue = asset.principal * Math.pow(1 + monthRate, completeMonths);
  }

  return accumulatedValue;
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
