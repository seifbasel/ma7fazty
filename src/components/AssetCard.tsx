import { Asset, Prices } from "@/types/asset";
import {
  calculateAssetValue,
  calculateProjectedRentValue,
  calculateProjectedSalaryValue,
  calculateProjectedInterestValue,
} from "@/lib/calculations";
import { getTypeIcon, getTypeColor } from "@/lib/assetTypes";
import { Pencil, Trash2, Calendar, TrendingUp, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPE_GRADIENTS: Record<string, string> = {
  gold: "from-amber-500/20 to-yellow-600/10 border-amber-500/30",
  silver: "from-slate-400/20 to-slate-500/10 border-slate-400/30",
  usd: "from-green-500/20 to-emerald-600/10 border-green-500/30",
  cash: "from-blue-500/20 to-cyan-600/10 border-blue-500/30",
  rent: "from-violet-500/20 to-purple-600/10 border-violet-500/30",
  interest: "from-rose-500/20 to-pink-600/10 border-rose-500/30",
};

const TYPE_ACCENT: Record<string, string> = {
  gold: "text-amber-400",
  silver: "text-slate-300",
  usd: "text-green-400",
  cash: "text-blue-400",
  rent: "text-violet-400",
  interest: "text-rose-400",
};

const TYPE_DOT: Record<string, string> = {
  gold: "bg-amber-400",
  silver: "bg-slate-300",
  usd: "bg-green-400",
  cash: "bg-blue-400",
  rent: "bg-violet-400",
  interest: "bg-rose-400",
};

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline py-1">
      <span className="text-xs text-slate-500 tracking-wide">{label}</span>
      <span
        className={`text-sm font-semibold ${accent ? "text-white" : "text-slate-300"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function AssetCard({
  asset,
  prices,
  onDelete,
  onEdit,
}: {
  asset: Asset;
  prices: Prices;
  onDelete: (id: number, name: string) => void;
  onEdit: (asset: Asset) => void;
}) {
  const value = calculateAssetValue(asset, prices);
  const gradient = TYPE_GRADIENTS[asset.type] ?? TYPE_GRADIENTS.cash;
  const accent = TYPE_ACCENT[asset.type] ?? "text-white";
  const dot = TYPE_DOT[asset.type] ?? "bg-white";

  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const projectedValue =
    asset.type === "rent"
      ? calculateProjectedRentValue(asset)
      : asset.type === "salary"
      ? calculateProjectedSalaryValue(asset)
      : asset.type === "interest"
      ? calculateProjectedInterestValue(asset)
      : null;

  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(asset.createdAt).getTime()) / 86400000
  );

  return (
    <div
      className={`relative bg-linear-to-br ${gradient} border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group overflow-hidden`}
    >
      {/* Background glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{
          background:
            asset.type === "gold"
              ? "#f59e0b"
              : asset.type === "silver"
              ? "#94a3b8"
              : asset.type === "usd"
              ? "#22c55e"
              : asset.type === "cash"
              ? "#3b82f6"
              : asset.type === "rent"
              ? "#8b5cf6"
              : "#f43f5e",
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className={`w-2 h-2 rounded-full ${dot} absolute -top-0.5 -right-0.5 ring-2 ring-slate-900`}
            />
            <span className="text-2xl">{getTypeIcon(asset.type)}</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">
              {asset.name}
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
              {asset.type}
              {asset.purity ? ` · ${asset.purity}K` : ""}
            </span>
          </div>
        </div>

        <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-100">
          <button
            onClick={() => onEdit(asset)}
            className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(asset.id, asset.name)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-0.5 mb-4">
        {asset.type === "interest" && (
          <>
            <InfoRow
              label="Principal"
              value={`${fmt(asset.principal ?? 0)} EGP`}
            />
            <InfoRow
              label="Rate"
              value={`${asset.interestRate}% ${asset.interestType === "compound" ? "compound" : "simple"}`}
            />
          </>
        )}
        {asset.type === "rent" && (
          <InfoRow
            label="Monthly Rent"
            value={`${fmt(asset.monthlyRent ?? 0)} EGP`}
          />
        )}
        {asset.type === "salary" && (
          <InfoRow
            label="Monthly Salary"
            value={`${fmt(asset.monthlySalary ?? 0)} EGP`}
          />
        )}
        {asset.type !== "rent" && asset.type !== "interest" && (
          <InfoRow
            label="Holding"
            value={`${fmt(asset.amount)} ${asset.unit}`}
          />
        )}
        {asset.startDate && (
          <InfoRow
            label="Since"
            value={new Date(asset.startDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-4" />

      {/* Value display */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
          {projectedValue ? "Current Value" : "Current Value"}
        </p>
        <p className={`text-2xl font-bold ${accent} tabular-nums`}>
          {fmt(value)}
          <span className="text-sm font-normal text-slate-500 ml-1">EGP</span>
        </p>

        {projectedValue && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
              Projected Total
            </span>
            <span className={`text-sm font-bold ${accent}`}>
              {fmt(projectedValue)} EGP
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-slate-600 flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5" />
          {daysSinceCreated === 0
            ? "Added today"
            : `${daysSinceCreated}d ago`}
        </span>
        {asset.endDate && (
          <span className="text-[10px] text-slate-600">
            Ends {new Date(asset.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}