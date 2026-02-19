"use client";

import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

export default function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent onClose={onCancel} >
        <div className="flex flex-col items-center text-center gap-4 pb-2">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDanger
                ? "bg-red-500/15 border border-red-500/25"
                : "bg-amber-500/15 border border-amber-500/25"
            }`}
          >
            {isDanger ? (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            ) : (
              <CheckCircle className="w-6 h-6 text-amber-400" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
          </div>

          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onConfirm}
              className={`flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg ${
                isDanger
                  ? "bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/25"
                  : "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/25"
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 h-11 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}