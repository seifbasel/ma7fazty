"use client";

import { useState } from "react";

import { useAssets } from "@/hooks/useAssets";
import { usePrices } from "@/hooks/usePrices";
import { getTotalValue } from "@/lib/calculations";
import { Asset } from "@/types/asset";
import Header from "@/components/Header";
import LivePrices from "@/components/LivePrices";
import PortfolioCard from "@/components/PortfolioCard";
import AssetDistribution from "@/components/AssetDistribution";
import AssetForm from "@/components/AssetForm";
import AssetFormModal from "@/components/AssetFormModal";
import AssetGrid from "@/components/AssetGrid";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function AssetTracker() {
  const prices = usePrices();
  const { assets, saveAssets } = useAssets();

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleSaveNew = (asset: Asset) => {
    saveAssets([...assets, asset]);
  };

  const handleSaveEdit = (asset: Asset) => {
    const updated = assets.map((a) => (a.id === asset.id ? asset : a));
    saveAssets(updated);
    setEditingAsset(null);
    setShowEditModal(false);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      saveAssets(assets.filter((a) => a.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  const total = getTotalValue(assets, prices);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <Header />
        <LivePrices prices={prices} />

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <PortfolioCard total={total} count={assets.length} />
          <AssetDistribution assets={assets} prices={prices} />
        </div>

        <AssetForm
          onSave={handleSaveNew}
          editingAsset={null}
          onCancel={() => {}}
        />

        <AssetFormModal
          open={showEditModal}
          editingAsset={editingAsset || undefined}
          onOpenChange={() => {
            setShowEditModal(false);
            setEditingAsset(null);
          }}
          onSave={handleSaveEdit}
        />

        <AssetGrid
          assets={assets}
          prices={prices}
          onDelete={handleDeleteClick}
          onEdit={handleEdit}
        />

        <ConfirmDialog
          open={!!deleteConfirm}
          title="Delete Asset"
          description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
