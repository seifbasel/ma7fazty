"use client";

import { useState, useEffect } from "react";
import { Asset } from "@/types/asset";
import { getTypeOptions } from "@/lib/assetTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AssetForm({
  onSave,
  editingAsset,
  onCancel,
  isModal = false,
}: {
  onSave: (asset: Asset) => void;
  editingAsset?: Asset | null;
  onCancel: () => void;
  isModal?: boolean;
}) {
  const defaultForm = {
    name: "",
    type: "cash" as "gold" | "silver" | "usd" | "cash" | "rent" | "interest",
    amount: "",
    unit: "EGP",
    purity: 24 as 18 | 21 | 22 | 24,
    monthlyRent: "",
    principal: "",
    interestRate: "",
    interestType: "simple" as "simple" | "compound",
    startDate: "",
    endDate: "",
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editingAsset) {
      setForm({
        name: editingAsset.name,
        type: editingAsset.type as any,
        amount: editingAsset.amount.toString(),
        unit: editingAsset.unit,
        purity: editingAsset.purity ?? 24,
        monthlyRent: editingAsset.monthlyRent?.toString() || "",
        principal: editingAsset.principal?.toString() || "",
        interestRate: editingAsset.interestRate?.toString() || "",
        interestType: editingAsset.interestType || "simple",
        startDate: editingAsset.startDate || "",
        endDate: editingAsset.endDate || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingAsset]);

  // Update unit based on type
  useEffect(() => {
    let newUnit = form.unit;

    switch (form.type) {
      case "gold":
      case "silver":
        newUnit = "grams";
        break;
      case "usd":
        newUnit = "USD";
        break;
      case "cash":
      case "rent":
      case "interest":
        newUnit = "EGP";
        break;
    }

    if (newUnit !== form.unit) {
      setForm((prev) => ({ ...prev, unit: newUnit }));
    }
  }, [form.type, form.unit]);

  const handleSubmit = () => {
    if (!form.name) return;

    // Validate based on asset type
    if (form.type === "rent") {
      if (!form.monthlyRent || !form.startDate) return;
    } else if (form.type === "interest") {
      if (!form.principal || !form.interestRate || !form.startDate) return;
    } else {
      if (!form.amount) return;
    }

    const asset: Asset = {
      id: editingAsset?.id || Date.now(),
      name: form.name,
      type: form.type as any,
      amount: form.type === "rent" ? parseFloat(form.monthlyRent) : form.type === "interest" ? parseFloat(form.principal) : parseFloat(form.amount),
      unit: form.unit,
      purity: form.type === "gold" ? form.purity : undefined,
      createdAt: editingAsset?.createdAt || new Date().toISOString(),
    };

    // Add type-specific fields
    if (form.type === "rent") {
      asset.monthlyRent = parseFloat(form.monthlyRent);
      asset.startDate = form.startDate;
      if (form.endDate) {
        asset.endDate = form.endDate;
      }
    } else if (form.type === "interest") {
      asset.principal = parseFloat(form.principal);
      asset.interestRate = parseFloat(form.interestRate);
      asset.interestType = form.interestType as "simple" | "compound";
      asset.startDate = form.startDate;
      if (form.endDate) {
        asset.endDate = form.endDate;
      }
    }

    onSave(asset);
    setForm(defaultForm);
  };

  const typeOptions = getTypeOptions();

  return (
    <div className={isModal ? "" : "card-gradient rounded-3xl p-8 mb-8"}>
      {!isModal && (
        <h2 className="text-2xl font-bold mb-6 text-white">
          {editingAsset ? "Edit Asset" : "Add New Asset"}
        </h2>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="text-slate-300 mb-2">Asset Name</Label>
          <Input
            placeholder="e.g., Emergency Fund, Gold Bar"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-slate-900/50 border-slate-700 text-white"
          />
        </div>

        <div>
          <Label className="text-slate-300 mb-2">Asset Type</Label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
            className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm text-white shadow-xs transition-all outline-none focus-visible:border-amber-500 focus-visible:ring-amber-500/50 focus-visible:ring-[3px]"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>

        {form.type !== "rent" && form.type !== "interest" && (
          <div>
            <Label className="text-slate-300 mb-2">Amount ({form.unit})</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
        )}

        {form.type === "rent" && (
          <>
            <div>
              <Label className="text-slate-300 mb-2">Monthly Rent (EGP)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.monthlyRent}
                onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2">Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2">End Date (Optional)</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
          </>
        )}

        {form.type === "interest" && (
          <>
            <div>
              <Label className="text-slate-300 mb-2">Principal (EGP)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.principal}
                onChange={(e) => setForm({ ...form, principal: e.target.value })}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2">Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="5.00"
                value={form.interestRate}
                onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2">Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2">Interest Type</Label>
              <select
                value={form.interestType}
                onChange={(e) =>
                  setForm({ ...form, interestType: e.target.value as "simple" | "compound" })
                }
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm text-white shadow-xs transition-all outline-none focus-visible:border-amber-500 focus-visible:ring-amber-500/50 focus-visible:ring-[3px]"
              >
                <option value="simple">Simple Interest</option>
                <option value="compound">Compound Interest (Monthly)</option>
              </select>
            </div>
            <div>
              <Label className="text-slate-300 mb-2">End Date (Optional)</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
          </>
        )}

        {form.type === "gold" && (
          <div>
            <Label className="text-slate-300 mb-2">Gold Purity</Label>

            <select
              value={form.purity}
              onChange={(e) =>
                setForm({
                  ...form,
                  purity: Number(e.target.value) as 18 | 21 | 22 | 24,
                })
              }
              className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm text-white shadow-xs transition-all outline-none focus-visible:border-amber-500 focus-visible:ring-amber-500/50 focus-visible:ring-[3px]"
            >
              <option value={24}>24K (Pure)</option>
              <option value={22}>22K</option>
              <option value={21}>21k</option>
              <option value={18}>18K</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 md:col-span-2">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
          >
            {editingAsset ? "💾 Save Changes" : "➕ Add Asset"}
          </Button>

          {editingAsset && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
