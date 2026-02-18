import { Prices } from "@/types/asset";
import { Coins, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function LivePrices({ prices }: { prices: Prices }) {
  const format = (num: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  const PriceCard = ({
    title,
    price,
    change,
    color,
    icon: Icon,
  }: {
    title: string;
    price: number;
    change?: number;
    color: string;
    icon: any;
  }) => (
    <div className="card-gradient rounded-xl p-6 shadow-xl shadow-amber-500/30 transition-all duration-300">
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-linear-to-br ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-400">{title}</p>
          </div>
        </div>
      </div>

      <p className={`text-3xl font-bold ${color.includes('amber') ? 'text-amber-400' : color.includes('slate') ? 'text-slate-300' : 'text-green-400'}`}>
        {format(price)} EGP
      </p>
      
      {change !== undefined && (
        <p className="text-2xl text-slate-600 mt-2">
          ${format(price / (prices.usdToEgp || 1))}
        </p>
      )}
    </div>
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Live Market Prices
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6 ">
        <PriceCard
          title="Gold per Oz"
          price={prices.gold.egp}
          change={prices.gold.usd}
          color="from-amber-500 to-orange-600"
          icon={Coins}
        />
        <PriceCard
          title="Silver per Oz"
          price={prices.silver.egp}
          change={prices.silver.usd}
          color="from-slate-400 to-slate-600"
          icon={Coins}
        />
        <PriceCard
          title="USD to EGP"
          price={prices.usdToEgp}
          color="from-green-500 to-emerald-600"
          icon={DollarSign}
        />
      </div>
    </div>
  );
}