import { Prices } from "@/types/asset";
import { Coins, DollarSign, TrendingUp } from "lucide-react";

export default function LivePrices({ prices }: { prices: Prices }) {
  const fmtEGP = (n: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const fmtUSD = (n: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const cards = [
    {
      title: "Gold",
      subtitle: "per troy oz",
      egp: prices.gold.egp,
      usd: prices.gold.usd,
      icon: Coins,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/20",
      border: "border-amber-500/20",
      bg: "from-amber-500/10 to-orange-500/5",
      accent: "text-amber-400",
      dot: "bg-amber-400",
    },
    {
      title: "Silver",
      subtitle: "per troy oz",
      egp: prices.silver.egp,
      usd: prices.silver.usd,
      icon: Coins,
      gradient: "from-slate-400 to-slate-500",
      glow: "shadow-slate-400/20",
      border: "border-slate-400/20",
      bg: "from-slate-400/10 to-slate-500/5",
      accent: "text-slate-300",
      dot: "bg-slate-300",
    },
    {
      title: "USD / EGP",
      subtitle: "exchange rate",
      egp: prices.usdToEgp,
      usd: null,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/20",
      border: "border-emerald-500/20",
      bg: "from-emerald-500/10 to-teal-500/5",
      accent: "text-emerald-400",
      dot: "bg-emerald-400",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-500 font-semibold uppercase tracking-widest">
            Live
          </span>
        </div>
        <h2 className="text-base font-bold text-white">Market Prices</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`relative bg-linear-to-br ${card.bg} border ${card.border} rounded-2xl p-5 overflow-hidden shadow-md ${card.glow} transition-all duration-300 hover:scale-[1.02]`}
            >
              {/* Ambient blob */}
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none`}
                style={{ background: card.gradient.includes("amber") ? "#f59e0b" : card.gradient.includes("slate") ? "#94a3b8" : "#10b981" }}
              />

              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{card.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{card.subtitle}</p>
                  </div>
                </div>
                <TrendingUp className={`w-4 h-4 ${card.accent} opacity-60`} />
              </div>

              {/* EGP value */}
              <p className={`text-2xl font-bold ${card.accent} tabular-nums leading-none`}>
                {fmtEGP(card.egp)}
                <span className="text-sm font-normal text-slate-500 ml-1">EGP</span>
              </p>

              {/* USD value or label */}
              {card.usd !== null ? (
                <p className="text-sm text-slate-600 mt-1.5 tabular-nums">
                  ${fmtUSD(card.usd)} <span className="text-slate-700">USD</span>
                </p>
              ) : (
                <p className="text-sm text-slate-600 mt-1.5">
                  1 USD = {fmtEGP(card.egp)} EGP
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}