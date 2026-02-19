import { Wallet } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-2">
        {/* Logo mark */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500 blur-xl opacity-40" />
          <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Wallet className="w-7 h-7 text-white drop-shadow" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl font-black tracking-tight leading-none bg-linear-to-r from-amber-200 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
            MA7FAZTY
          </h1>
          <p className="text-slate-500 text-sm mt-1 tracking-widest uppercase font-medium">
            Track your wealth · anywhere
          </p>
        </div>
      </div>

      {/* Decorative divider */}
      <div className="mt-6 h-px bg-linear-to-r from-amber-500/30 via-amber-500/10 to-transparent" />
    </div>
  );
}