import { Asset, Prices } from "@/types/asset";
import { calculateAssetValue, calculateProjectedRentValue, calculateProjectedInterestValue } from "@/lib/calculations";
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
  onDelete: (id: number, name: string) => void;
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
      case "rent":
        return "🏠";
      case "interest":
        return "📈";
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
      case "rent":
        return "text-blue-400";
      case "interest":
        return "text-purple-400";
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
        
        <div className="flex gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(asset)}
            className="hover:bg-blue-500/20 hover:text-blue-400"
          >
            <Pencil className="w-5 h-5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(asset.id, asset.name)}
            className="bg-red-500/20 text-red-400"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {asset.type !== "rent" && (
          <div className="flex justify-between items-baseline">
            <p className="text-sm text-slate-500">Amount:</p>
            <p className="text-white font-medium">
              {asset.type === "interest"
                ? `Principal: ${asset.principal?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} EGP`
                : formatAmount(asset.amount, asset.unit)}
            </p>
          </div>
        )}

        {asset.type === "interest" && (
          <div className="flex justify-between items-baseline">
            <p className="text-sm text-slate-500">Rate:</p>
            <p className="text-white font-medium">
              {asset.interestRate}% ({asset.interestType === "simple" ? "Simple" : "Compound"})
            </p>
          </div>
        )}

        {(asset.type === "rent" || asset.type === "interest") ? (
          <>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/50">
              <p className="text-sm text-slate-500">Current Value:</p>
              <p className={`text-lg font-bold ${getTypeColor(asset.type)}`}>
                {value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} EGP
              </p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-sm text-slate-500">Total Value:</p>
              <p className={`text-xl font-bold ${getTypeColor(asset.type)}`}>
                {(asset.type === "rent"
                  ? calculateProjectedRentValue(asset)
                  : calculateProjectedInterestValue(asset)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} EGP
              </p>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/50">
            <p className="text-sm text-slate-500">Value:</p>
            <p className={`text-xl font-bold ${getTypeColor(asset.type)}`}>
              {value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} EGP
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/30">
        <p className="text-xs text-slate-600">
          Added {new Date(asset.createdAt).toLocaleDateString()}
          {asset.endDate && (
            <> • Ends {new Date(asset.endDate).toLocaleDateString()}</>
          )}
        </p>
      </div>
    </div>
  );
}