"use client";

import { useState } from "react";

import { useAssets } from "@/hooks/useAssets";
import { usePrices } from "@/hooks/usePrices";
import { getTotalValue } from "@/lib/calculations";
import { Asset } from "@/types/asset";
import Header from "@/components/Header";
import LivePrices from "@/components/LivePrices";
import PortfolioCard from "@/components/PortfolioCard";
import AssetForm from "@/components/AssetForm";
import AssetGrid from "@/components/AssetGrid";

export default function AssetTracker() {
  const prices = usePrices();
  const { assets, saveAssets } = useAssets();

  const [editing, setEditing] = useState<Asset | null>(null);

  const handleSave = (asset: Asset) => {
    const updated = editing
      ? assets.map((a) => (a.id === asset.id ? asset : a))
      : [...assets, asset];

    saveAssets(updated);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    saveAssets(assets.filter((a) => a.id !== id));
  };

  const total = getTotalValue(assets, prices);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <Header />
        <LivePrices prices={prices} />
        <PortfolioCard total={total} count={assets.length} />

        <AssetForm
          onSave={handleSave}
          editingAsset={editing}
          onCancel={() => setEditing(null)}
        />

        <AssetGrid
          assets={assets}
          prices={prices}
          onDelete={handleDelete}
          onEdit={setEditing}
        />
      </div>
    </div>
  );
}
