// Centralized asset type configuration - single source of truth
export const ASSET_TYPES = {
  gold: {
    icon: "🪙",
    label: "Gold",
    color: "text-amber-400",
    hexColor: "#fbbf24",
  },
  silver: {
    icon: "🥈",
    label: "Silver",
    color: "text-slate-300",
    hexColor: "#cbd5e1",
  },
  usd: {
    icon: "💵",
    label: "US Dollar",
    color: "text-green-400",
    hexColor: "#4ade80",
  },
  rent: {
    icon: "🏠",
    label: "Rent",
    color: "text-blue-400",
    hexColor: "#60a5fa",
  },
  interest: {
    icon: "📈",
    label: "Interest",
    color: "text-purple-400",
    hexColor: "#d8b4fe",
  },
  cash: {
    icon: "💰",
    label: "Cash",
    color: "text-emerald-400",
    hexColor: "#10b981",
  },
  salary: {
  icon: "💼",
  label: "Salary",
  color: "text-sky-400",
  hexColor: "#38bdf8",
},
} as const;

export const getTypeIcon = (type: string) => ASSET_TYPES[type as keyof typeof ASSET_TYPES]?.icon ?? "💰";
export const getTypeColor = (type: string) => ASSET_TYPES[type as keyof typeof ASSET_TYPES]?.color ?? "text-emerald-400";
export const getTypeLabel = (type: string) => ASSET_TYPES[type as keyof typeof ASSET_TYPES]?.label ?? "Cash";
export const getTypeHexColor = (type: string) => ASSET_TYPES[type as keyof typeof ASSET_TYPES]?.hexColor ?? "#10b981";

export const getTypeOptions = () =>
  Object.entries(ASSET_TYPES).map(([value, { icon, label }]) => ({
    value,
    label,
    icon,
  }));
