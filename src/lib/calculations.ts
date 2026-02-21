import { Asset, Prices } from "@/types/asset";

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateMonthsElapsed(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44); // Average month = 30.44 days
  return Math.max(0, diffMonths);
}

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

// ─── Per-type value calculators ──────────────────────────────────────────────

function calculateRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate));
  return asset.monthlyRent * completeMonths;
}

export function calculateProjectedRentValue(asset: Asset): number {
  if (!asset.monthlyRent || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate, asset.endDate));
  return asset.monthlyRent * completeMonths;
}

function calculateSalaryValue(asset: Asset): number {
  if (!asset.monthlySalary || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate));
  return asset.monthlySalary * completeMonths;
}

export function calculateProjectedSalaryValue(asset: Asset): number {
  if (!asset.monthlySalary || !asset.startDate) return 0;
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate, asset.endDate));
  return asset.monthlySalary * completeMonths;
}

function calculateInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate));
  return calculateInterestAccumulation(
    asset.principal,
    asset.interestRate,
    completeMonths,
    asset.interestType === "simple"
  );
}

export function calculateProjectedInterestValue(asset: Asset): number {
  if (!asset.principal || !asset.interestRate || !asset.startDate || !asset.interestType) {
    return asset.amount || 0;
  }
  const completeMonths = Math.floor(calculateMonthsElapsed(asset.startDate, asset.endDate));
  return calculateInterestAccumulation(
    asset.principal,
    asset.interestRate,
    completeMonths,
    asset.interestType === "simple"
  );
}

// ─── Main calculators ────────────────────────────────────────────────────────

export function calculateAssetValue(asset: Asset, prices: Prices): number {
  switch (asset.type) {
    case "rent":
      return calculateRentValue(asset);

    case "salary":
      return calculateSalaryValue(asset);

    case "interest":
      return calculateInterestValue(asset);

    case "gold": {
      // Guard: prices not yet loaded
      if (!prices?.gold?.egp) return 0;
      const purityFactor = (asset.purity ?? 24) / 24;
      return ((asset.amount * prices.gold.egp) / 31.1035) * purityFactor;
    }

    case "silver":
      // Guard: prices not yet loaded
      if (!prices?.silver?.egp) return 0;
      return (asset.amount * prices.silver.egp) / 31.1035;

    case "usd":
      // Guard: prices not yet loaded
      if (!prices?.usdToEgp) return 0;
      return asset.amount * prices.usdToEgp;

    case "cash":
    default:
      return asset.amount;
  }
}

export function getTotalValue(assets: Asset[], prices: Prices): number {
  return assets.reduce((total, asset) => total + calculateAssetValue(asset, prices), 0);
}