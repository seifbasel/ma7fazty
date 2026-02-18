import { Wallet } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight bg-linear-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
          MA7FAZTY
        </h1>
      </div>
      <p className="text-slate-400 text-lg ml-20">
        Track your wealth anywhere
      </p>
    </div>
  );
}
