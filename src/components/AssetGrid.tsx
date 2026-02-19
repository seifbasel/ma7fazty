import { Asset, Prices } from "@/types/asset";
import AssetCard from "./AssetCard";
import { LayoutGrid } from "lucide-react";

export default function AssetGrid({
  assets,
  prices,
  onDelete,
  onEdit,
}: {
  assets: Asset[];
  prices: Prices;
  onDelete: (id: number, name: string) => void;
  onEdit: (asset: Asset) => void;
}) {
  if (!assets.length) {
    return (
      <div className="relative border border-dashed border-slate-700/60 rounded-3xl p-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/40 to-slate-800/20 pointer-events-none" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-semibold text-base mb-1">No assets yet</p>
          <p className="text-slate-600 text-sm">Add your first asset above to start tracking your portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-white">Your Assets</h2>
          <p className="text-xs text-slate-500">
            {assets.length} position{assets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            prices={prices}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}