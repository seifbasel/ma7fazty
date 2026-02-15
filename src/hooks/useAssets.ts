import { useEffect, useState } from "react";
import { Asset } from "@/types/asset";

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("assets");
    if (stored) setAssets(JSON.parse(stored));
  }, []);

  const saveAssets = (updated: Asset[]) => {
    localStorage.setItem("assets", JSON.stringify(updated));
    setAssets(updated);
  };

  return { assets, saveAssets };
}
