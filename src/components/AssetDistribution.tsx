"use client";

import { Asset, Prices } from "@/types/asset";
import { calculateAssetValue } from "@/lib/calculations";
import { getTypeIcon, getTypeLabel, getTypeHexColor } from "@/lib/assetTypes";
import PieChart from "./PieChart";

export default function AssetDistribution({
  assets,
  prices,
}: {
  assets: Asset[];
  prices: Prices;
}) {
  // Group assets by type and calculate total value
  const typeDistribution = assets.reduce(
    (acc, asset) => {
      const value = calculateAssetValue(asset, prices);
      const type = asset.type;

      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += value;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(typeDistribution).map(([type, value]) => ({
    label: `${getTypeIcon(type)} ${getTypeLabel(type)}`,
    value: Math.round(value),
    color: getTypeHexColor(type),
  }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="card-gradient rounded-3xl p-6 glow-amber">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">
            Asset Distribution
          </p>
          <p className="text-xs text-slate-500">{chartData.length} types</p>
        </div>
      </div>
      <div className="flex justify-center">
        <PieChart data={chartData} width={320} height={300} showLegend={true} compact={true} />
      </div>
    </div>
  );
}
