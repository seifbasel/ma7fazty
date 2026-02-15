import { Asset, Prices } from "@/types/asset";
import { calculateAssetValue } from "@/lib/calculations";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssetCard({
  asset,
  prices,
  onDelete,
  onEdit,
}: {
  asset: Asset;
  prices: Prices;
  onDelete: (id: number) => void;
  onEdit: (asset: Asset) => void;
}) {
  const value = calculateAssetValue(asset, prices);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "gold":
        return "🪙";
      case "silver":
        return "🥈";
      case "usd":
        return "💵";
      case "cash":
      default:
        return "💰";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "gold":
        return "text-amber-400";
      case "silver":
        return "text-slate-300";
      case "usd":
        return "text-green-400";
      case "cash":
      default:
        return "text-emerald-400";
    }
  };

  const formatAmount = (amount: number, unit: string) => {
    return `${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${unit}`;
  };

  return (
    <div className="card-gradient border rounded-2xl p-6 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getTypeIcon(asset.type)}</span>
            <h3 className="font-bold text-white text-lg">{asset.name}</h3>
          </div>
          <p className="text-sm text-slate-400 capitalize">{asset.type}</p>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(asset)}
            className="hover:bg-blue-500/20 hover:text-blue-400"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(asset.id)}
            className="hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <p className="text-sm text-slate-500">Amount:</p>
          <p className="text-white font-medium">
            {formatAmount(asset.amount, asset.unit)}
          </p>
        </div>
        
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/50">
          <p className="text-sm text-slate-500">Value:</p>
          <p className={`text-xl font-bold ${getTypeColor(asset.type)}`}>
            {value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} EGP
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/30">
        <p className="text-xs text-slate-600">
          Added {new Date(asset.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}