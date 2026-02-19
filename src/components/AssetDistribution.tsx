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
  const typeDistribution = assets.reduce(
    (acc, asset) => {
      const value = calculateAssetValue(asset, prices);
      const type = asset.type;
      if (!acc[type]) acc[type] = 0;
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

  if (chartData.length === 0) return null;

  return (
    <div className="relative bg-linear-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-500 rounded-full opacity-[0.06] blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <span className="text-lg">📊</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Asset Distribution</p>
          <p className="text-xs text-slate-500">{chartData.length} {chartData.length === 1 ? "type" : "types"}</p>
        </div>
      </div>

      {/* Bigger pie — full width, taller */}
      <PieChart
        data={chartData}
        width={400}
        height={340}
        showLegend={true}
        compact={false}
      />
    </div>
  );
}