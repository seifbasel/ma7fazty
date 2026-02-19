"use client";

import { Asset } from "@/types/asset";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AssetForm from "./AssetForm";

interface AssetFormModalProps {
  open: boolean;
  editingAsset?: Asset | null;
  onOpenChange: (open: boolean) => void;
  onSave: (asset: Asset) => void;
}

export default function AssetFormModal({
  open,
  editingAsset,
  onOpenChange,
  onSave,
}: AssetFormModalProps) {
  const handleClose = () => onOpenChange(false);

  const handleSave = (asset: Asset) => {
    onSave(asset);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>
            <span className="text-xl">{editingAsset ? "✏️" : "➕"}</span>
            {editingAsset ? "Edit Asset" : "Add New Asset"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <AssetForm
            onSave={handleSave}
            editingAsset={editingAsset}
            onCancel={handleClose}
            isModal
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}