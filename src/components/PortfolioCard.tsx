import { TrendingUp, Wallet } from "lucide-react";
import { Asset, Prices } from "@/types/asset";
import { calculateAssetValue } from "@/lib/calculations";

export default function PortfolioCard({
  total,
  count,
  assets,
  prices,
}: {
  total: number;
  count: number;
  assets?: Asset[];
  prices?: Prices;
}) {
  // Calculate top asset by value
  const topAsset =
    assets && prices
      ? assets.reduce<{ name: string; value: number } | null>((top, a) => {
          const v = calculateAssetValue(a, prices);
          return !top || v > top.value ? { name: a.name, value: v } : top;
        }, null)
      : null;

  const topPct =
    topAsset && total > 0
      ? ((topAsset.value / total) * 100).toFixed(1)
      : null;

  return (
    <div className="relative bg-linear-to-br from-emerald-500/15 to-teal-600/10 border border-emerald-500/25 rounded-3xl p-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-emerald-500 rounded-full opacity-[0.07] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-400 rounded-full opacity-[0.07] blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">Total Portfolio</p>
          <p className="text-xs text-slate-600">All assets combined</p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
        </div>
      </div>

      {/* Main value */}
      <div className="mb-5">
        <p className="text-4xl font-bold text-emerald-400 tabular-nums leading-none">
          {total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-slate-500 mt-1.5">Egyptian Pounds (EGP)</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/4 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
            Assets
          </p>
          <p className="text-xl font-bold text-white">{count}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {count === 1 ? "position" : "positions"}
          </p>
        </div>

        <div className="bg-white/4 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
            Top Holding
          </p>
          {topAsset ? (
            <>
              <p className="text-sm font-bold text-white truncate">
                {topAsset.name}
              </p>
              <p className="text-[10px] text-emerald-500 mt-0.5">
                {topPct}% of portfolio
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">—</p>
          )}
        </div>
      </div>
    </div>
  );
}