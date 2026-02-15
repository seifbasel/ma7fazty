import { DollarSign } from "lucide-react";

export default function PortfolioCard({
  total,
  count,
}: {
  total: number;
  count: number;
}) {
  return (
    <div className="card-gradient rounded-3xl p-6 glow-green">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">
            Total Value
          </p>
          <p className="text-xs text-slate-500">All Assets</p>
        </div>
      </div>

      <p className="text-3xl font-bold text-green-400 mono">
        {total.toLocaleString()} EGP
      </p>
      <p className="text-sm text-slate-500 mt-1">
        {count} asset{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
