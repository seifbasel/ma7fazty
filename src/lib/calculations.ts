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
    ? principal + monthlyInterest * completeMonths
    : principal * Math.pow(1 + monthlyRate, completeMonths);
}

// Calculate rent value (from start to today)
function calculateRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate));
  return asset.monthlyRent * completeMonths;
}

// Calculate projected total value for rent (from start to end date)
export function calculateProjectedRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate, asset.endDate));
  return asset.monthlyRent * completeMonths;
}

// Calculate salary value (from start to today) — identical logic to rent
function calculateSalaryValue(asset: Asset): number {
  if (!asset.monthlySalary || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate));
  return asset.monthlySalary * completeMonths;
}

// Calculate projected total value for salary (from start to end date)
export function calculateProjectedSalaryValue(asset: Asset): number {
  if (!asset.monthlySalary || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate, asset.endDate));
  return asset.monthlySalary * completeMonths;
}

// Calculate interest value (from start to today)
function calculateInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate));
  return calculateInterestAccumulation(asset.principal, asset.interestRate, completeMonths, asset.interestType === "simple");
}

// Calculate projected total value for interest (from start to end date)
export function calculateProjectedInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate, asset.endDate));
  return calculateInterestAccumulation(asset.principal, asset.interestRate, completeMonths, asset.interestType === "simple");
}

export function getTotalValue(assets: Asset[], prices: Prices): number {
  return assets.reduce((total, asset) => total + calculateAssetValue(asset, prices), 0);
}

export function calculateAssetValue(asset: Asset, prices: Prices): number {
  switch (asset.type) {
    case "rent":
      return calculateRentValue(asset);

    case "salary":
      return calculateSalaryValue(asset);

    case "interest":
      return calculateInterestValue(asset);

    case "gold": {
      const purityFactor = (asset.purity ?? 24) / 24;
      return ((asset.amount * prices.gold.egp) / 31.1035) * purityFactor;
    }

    case "silver":
      return (asset.amount * prices.silver.egp) / 31.1035;

    case "usd":
      return asset.amount * prices.usdToEgp;

    case "cash":
    default:
      return asset.amount;
  }
}