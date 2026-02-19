"use client";

import { useState, useEffect } from "react";
import { Asset } from "@/types/asset";
import { getTypeOptions } from "@/lib/assetTypes";
import { PlusCircle, Save, X } from "lucide-react";

const FIELD_CLASS =
  "w-full h-10 rounded-xl border border-slate-700/70 bg-slate-900/60 px-3.5 py-2 text-sm text-white placeholder-slate-600 shadow-inner transition-all outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 focus:bg-slate-900";

const SELECT_CLASS =
  "w-full h-10 rounded-xl border border-slate-700/70 bg-slate-900/60 px-3.5 py-2 text-sm text-white shadow-inner transition-all outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title && (
        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-slate-800" />
          {title}
          <span className="h-px flex-1 bg-slate-800" />
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

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

  useEffect(() => {
    const unitMap: Record<string, string> = {
      gold: "grams",
      silver: "grams",
      usd: "USD",
      cash: "EGP",
      rent: "EGP",
      interest: "EGP",
    };
    const newUnit = unitMap[form.type];
    if (newUnit && newUnit !== form.unit) {
      setForm((prev) => ({ ...prev, unit: newUnit }));
    }
  }, [form.type]);

  const handleSubmit = () => {
    if (!form.name) return;
    if (form.type === "rent" && (!form.monthlyRent || !form.startDate)) return;
    if (
      form.type === "interest" &&
      (!form.principal || !form.interestRate || !form.startDate)
    )
      return;
    if (
      form.type !== "rent" &&
      form.type !== "interest" &&
      !form.amount
    )
      return;

    const asset: Asset = {
      id: editingAsset?.id || Date.now(),
      name: form.name,
      type: form.type as any,
      amount:
        form.type === "rent"
          ? parseFloat(form.monthlyRent)
          : form.type === "interest"
          ? parseFloat(form.principal)
          : parseFloat(form.amount),
      unit: form.unit,
      purity: form.type === "gold" ? form.purity : undefined,
      createdAt: editingAsset?.createdAt || new Date().toISOString(),
    };

    if (form.type === "rent") {
      asset.monthlyRent = parseFloat(form.monthlyRent);
      asset.startDate = form.startDate;
      if (form.endDate) asset.endDate = form.endDate;
    } else if (form.type === "interest") {
      asset.principal = parseFloat(form.principal);
      asset.interestRate = parseFloat(form.interestRate);
      asset.interestType = form.interestType;
      asset.startDate = form.startDate;
      if (form.endDate) asset.endDate = form.endDate;
    }

    onSave(asset);
    setForm(defaultForm);
  };

  const typeOptions = getTypeOptions();
  const isEditing = !!editingAsset;

  return (
    <div
      className={
        isModal
          ? "space-y-5"
          : "relative bg-linear-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-3xl p-7 mb-8 overflow-hidden"
      }
    >
      {/* Decorative bg */}
      {!isModal && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      )}

      {!isModal && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? "Edit Asset" : "Add New Asset"}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing ? "Update asset details" : "Track a new position"}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Basic info */}
        <Section>
          <div>
            <FieldLabel>Asset Name</FieldLabel>
            <input
              className={FIELD_CLASS}
              placeholder="e.g. Emergency Fund, Gold Bar…"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Asset Type</FieldLabel>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as any })
                }
                className={SELECT_CLASS}
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.icon} {o.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </Section>

        {/* Type-specific fields */}
        {form.type !== "rent" && form.type !== "interest" && (
          <Section title="Position">
            <div>
              <FieldLabel>Amount ({form.unit})</FieldLabel>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className={FIELD_CLASS}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            {form.type === "gold" && (
              <div>
                <FieldLabel>Gold Purity</FieldLabel>
                <div className="relative">
                  <select
                    value={form.purity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        purity: Number(e.target.value) as 18 | 21 | 22 | 24,
                      })
                    }
                    className={SELECT_CLASS}
                  >
                    <option value={24}>24K — Pure Gold</option>
                    <option value={22}>22K</option>
                    <option value={21}>21K</option>
                    <option value={18}>18K</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </Section>
        )}

        {form.type === "rent" && (
          <Section title="Rental Details">
            <div>
              <FieldLabel>Monthly Rent (EGP)</FieldLabel>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className={FIELD_CLASS}
                value={form.monthlyRent}
                onChange={(e) =>
                  setForm({ ...form, monthlyRent: e.target.value })
                }
              />
            </div>
            <div>
              <FieldLabel>Start Date</FieldLabel>
              <input
                type="date"
                className={FIELD_CLASS}
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <FieldLabel>End Date (Optional)</FieldLabel>
              <input
                type="date"
                className={FIELD_CLASS}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </Section>
        )}

        {form.type === "interest" && (
          <Section title="Interest Details">
            <div>
              <FieldLabel>Principal (EGP)</FieldLabel>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className={FIELD_CLASS}
                value={form.principal}
                onChange={(e) =>
                  setForm({ ...form, principal: e.target.value })
                }
              />
            </div>
            <div>
              <FieldLabel>Annual Rate (%)</FieldLabel>
              <input
                type="number"
                step="0.01"
                placeholder="5.00"
                className={FIELD_CLASS}
                value={form.interestRate}
                onChange={(e) =>
                  setForm({ ...form, interestRate: e.target.value })
                }
              />
            </div>
            <div>
              <FieldLabel>Interest Type</FieldLabel>
              <div className="relative">
                <select
                  value={form.interestType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      interestType: e.target.value as "simple" | "compound",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="simple">Simple Interest</option>
                  <option value="compound">Compound (Monthly)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <FieldLabel>Start Date</FieldLabel>
              <input
                type="date"
                className={FIELD_CLASS}
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <FieldLabel>End Date (Optional)</FieldLabel>
              <input
                type="date"
                className={FIELD_CLASS}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </Section>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Add Asset
              </>
            )}
          </button>

          {isEditing && (
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-all"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}