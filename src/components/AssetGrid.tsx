import { Asset, Prices } from "@/types/asset";
import AssetCard from "./AssetCard";

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
  if (!assets.length)
    return (
      <div className="card-gradient rounded-3xl p-12 text-center">
        No assets yet.
      </div>
    );

  return (
    <div className="grid md:grid-cols-3 gap-6">
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
  );
}
