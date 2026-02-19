"use client";

import React, { useState, useMemo, useRef } from "react";
import { Asset, Prices } from "@/types/asset";

interface MonthlyGrowthChartProps {
  assets: Asset[];
  prices: Prices;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TROY_OZ_TO_GRAMS = 31.1035;

function projectAssetValue(asset: Asset, prices: Prices, targetDate: Date): number {
  // Mirror calculateMonthsElapsed from calculations.ts exactly
  const getCompleteMonths = (startStr: string, endDate: Date): number => {
    const start = new Date(startStr);
    const diffMs = endDate.getTime() - start.getTime();
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44); // matches calculations.ts constant
    return Math.floor(Math.max(0, diffMonths));
  };

  // Clamp targetDate to endDate if set
  const end = asset.endDate ? new Date(asset.endDate) : null;
  const effective = end && targetDate > end ? end : targetDate;

  switch (asset.type) {
    case "cash":
      return asset.amount;

    case "usd":
      return asset.amount * prices.usdToEgp;

    case "gold": {
      // Matches calculateAssetValue gold branch exactly
      const purityFactor = (asset.purity ?? 24) / 24;
      return ((asset.amount * prices.gold.egp) / TROY_OZ_TO_GRAMS) * purityFactor;
    }

    case "silver":
      // Matches calculateAssetValue silver branch exactly
      return (asset.amount * prices.silver.egp) / TROY_OZ_TO_GRAMS;

    case "rent": {
      if (!asset.monthlyRent || !asset.startDate) return 0;
      const completeMonths = getCompleteMonths(asset.startDate, effective);
      return asset.monthlyRent * completeMonths;
    }

    case "salary": {
      if (!asset.monthlySalary || !asset.startDate) return 0;
      const completeMonths = getCompleteMonths(asset.startDate, effective);
      return asset.monthlySalary * completeMonths;
    }

    case "interest": {
      if (!asset.principal || !asset.interestRate || !asset.interestType) return asset.amount || 0;
      const P = asset.principal;
      const monthlyRate = asset.interestRate / 100 / 12;
      const completeMonths = asset.startDate ? getCompleteMonths(asset.startDate, effective) : 0;
      // Matches calculateInterestAccumulation exactly
      return asset.interestType === "simple"
        ? P + P * monthlyRate * completeMonths
        : P * Math.pow(1 + monthlyRate, completeMonths);
    }

    default:
      return 0;
  }
}

function buildProjection(assets: Asset[], prices: Prices, months = 12) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const value = assets.reduce((sum, asset) => sum + projectAssetValue(asset, prices, targetDate), 0);
    return { label: MONTHS[targetDate.getMonth()], year: targetDate.getFullYear(), value: Math.round(value) };
  });
}

const fmt = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
};

export default function MonthlyGrowthChart({ assets, prices }: MonthlyGrowthChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(() => buildProjection(assets, prices, 12), [assets, prices]);
  const currentTotal = useMemo(
    () => assets.reduce((sum, a) => sum + projectAssetValue(a, prices, new Date()), 0),
    [assets, prices]
  );

  if (!assets.length) return null;

  // All points: index 0 = "Now", 1-12 = future months
  const allPoints = [
    { label: "Now", year: new Date().getFullYear(), value: Math.round(currentTotal), isNow: true },
    ...data.map((d) => ({ ...d, isNow: false })),
  ];

  const values = allPoints.map((p) => p.value);
  const minVal = Math.min(...values) * 0.97;
  const maxVal = Math.max(...values) * 1.02;
  const range = maxVal - minVal || 1;

  // SVG dimensions — pure rendering, no interaction
  const W = 560;
  const H = 200;
  const PAD = { top: 20, right: 12, bottom: 8, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (i / (allPoints.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / range) * chartH;

  const pts = allPoints.map((p, i) => ({ x: toX(i), y: toY(p.value) }));

  const linePath = pts.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return path + ` C ${cpX} ${prev.y} ${cpX} ${pt.y} ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${PAD.top + chartH} L ${pts[0].x} ${PAD.top + chartH} Z`;

  const yTicks = Array.from({ length: 4 }, (_, i) => minVal + (range * i) / 3);

  const finalValue = data[data.length - 1].value;
  const totalGrowth = finalValue - currentTotal;
  const totalGrowthPct = currentTotal > 0 ? ((totalGrowth / currentTotal) * 100).toFixed(1) : "0.0";
  const isPositive = totalGrowth >= 0;

  const active = activeIndex !== null ? allPoints[activeIndex] : null;
  const activePt = activeIndex !== null ? pts[activeIndex] : null;

  // Tooltip info
  const growthFromNow = active && !active.isNow ? active.value - currentTotal : null;
  const growthPct = growthFromNow !== null && currentTotal > 0
    ? ((growthFromNow / currentTotal) * 100).toFixed(1) : null;
  const prevValue = activeIndex !== null && activeIndex > 0 ? allPoints[activeIndex - 1].value : null;
  const momChange = prevValue !== null && active ? active.value - prevValue : null;

  return (
    <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-3xl p-4 sm:p-6 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <span className="text-base sm:text-lg">📈</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">12-Month Projection</p>
            <p className="text-xs text-slate-500">Next 12 months forecast</p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className={`text-sm font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{fmt(totalGrowth)} EGP
          </p>
          <p className={`text-xs ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(Number(totalGrowthPct))}% total
          </p>
        </div>
      </div>

      {/* Tooltip card — shown above chart when active */}
      <div
        className="mb-3 transition-all duration-150"
        style={{ minHeight: "3rem" }}
      >
        {active ? (
          <div className="flex items-center justify-between bg-slate-900/80 border border-emerald-500/20 rounded-2xl px-4 py-2.5">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                {active.isNow ? "Today" : `${active.label} ${active.year}`}
              </p>
              <p className="text-base font-bold text-white tabular-nums">
                {active.value.toLocaleString()} EGP
              </p>
            </div>
            <div className="text-right">
              {growthFromNow !== null && (
                <p className={`text-xs font-semibold ${growthFromNow >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {growthFromNow >= 0 ? "+" : ""}{fmt(growthFromNow)} EGP from now
                </p>
              )}
              {momChange !== null && !active.isNow && (
                <p className={`text-xs ${momChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {momChange >= 0 ? "+" : ""}{fmt(momChange)} vs prev month
                </p>
              )}
              {active.isNow && (
                <p className="text-xs text-slate-600">Current value</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-slate-900/40 border border-slate-800/60 rounded-2xl px-4 py-2.5">
            <p className="text-xs text-slate-600">
              Tap or hover any month to see details
            </p>
          </div>
        )}
      </div>

      {/* Chart area — SVG + transparent HTML column overlay */}
      <div className="relative w-full h-52 sm:h-auto">
        {/* SVG — pure rendering only, no events */}
        {/* height class: taller on mobile (h-56 = 224px), auto on sm+ so viewBox scales naturally */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="block h-52 sm:h-auto"
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <defs>
            <linearGradient id="mgArea2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="mgLine2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <filter id="mgGlow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Y grid + labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={toY(v)} x2={PAD.left + chartW} y2={toY(v)} stroke="rgba(148,163,184,0.07)" strokeDasharray="4 4" />
              <text x={PAD.left - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="rgb(71,85,105)">
                {fmt(v)}
              </text>
            </g>
          ))}

          {/* "Now" dashed marker */}
          <line x1={pts[0].x} y1={PAD.top} x2={pts[0].x} y2={PAD.top + chartH} stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />

          {/* Area + line */}
          <path d={areaPath} fill="url(#mgArea2)" />
          <path d={linePath} fill="none" stroke="url(#mgLine2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Active crosshair + dot */}
          {activePt && (
            <g>
              <line x1={activePt.x} y1={PAD.top} x2={activePt.x} y2={PAD.top + chartH} stroke="rgba(52,211,153,0.25)" strokeWidth="1" strokeDasharray="4 3" />
              <circle cx={activePt.x} cy={activePt.y} r="7" fill="#10b981" filter="url(#mgGlow2)" />
              <circle cx={activePt.x} cy={activePt.y} r="3.5" fill="white" />
            </g>
          )}

          {/* Static dots */}
          {pts.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r={allPoints[i].isNow ? 4 : 2.5}
              fill={allPoints[i].isNow ? "rgb(100,116,139)" : "#10b981"}
              opacity={activeIndex === i ? 0 : 0.6}
            />
          ))}
        </svg>

        {/* Transparent HTML hit columns — absolutely positioned over the SVG */}
        <div
          className="absolute inset-0 flex"
          style={{
            paddingLeft: `${(PAD.left / W) * 100}%`,
            paddingRight: `${(PAD.right / W) * 100}%`,
          }}
        >
          {allPoints.map((_, i) => (
            <button
              key={i}
              className="flex-1 h-full cursor-crosshair"
              style={{ background: "transparent", border: "none", padding: 0 }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onTouchStart={() => setActiveIndex(i)}
              onTouchEnd={() => setActiveIndex(null)}
              aria-label={`View ${allPoints[i].label} data`}
            />
          ))}
        </div>
      </div>

      {/* X-axis month labels — HTML row, much easier to control on mobile */}
      <div
        className="flex mt-1"
        style={{
          paddingLeft: `${(PAD.left / W) * 100}%`,
          paddingRight: `${(PAD.right / W) * 100}%`,
        }}
      >
        {allPoints.map((p, i) => (
          <div key={i} className="flex-1 text-center">
            <p
              className="text-[9px] sm:text-[10px] font-medium transition-colors duration-100 truncate"
              style={{ color: activeIndex === i ? "rgb(52,211,153)" : p.isNow ? "rgb(148,163,184)" : "rgb(71,85,105)" }}
            >
              {/* Hide every other label on very small displays */}
              {i % 2 === 0 || i === allPoints.length - 1 ? p.label : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Month-over-month strip — horizontally scrollable on mobile */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-semibold">
          Month-over-month
        </p>
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {data.map((d, i) => {
            const prev = i === 0 ? currentTotal : data[i - 1].value;
            const change = d.value - prev;
            const pct = prev > 0 ? ((change / prev) * 100).toFixed(1) : "0.0";
            const isPos = change >= 0;
            return (
              <div
                key={i}
                className="shrink-0 w-9 sm:flex-1 sm:w-auto text-center px-0.5 py-1.5 rounded-lg transition-colors duration-100 cursor-default"
                style={{ backgroundColor: activeIndex === i + 1 ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)" }}
                onMouseEnter={() => setActiveIndex(i + 1)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <p className="text-[8px] text-slate-600 mb-0.5">{d.label}</p>
                <p className="text-[9px] font-bold" style={{ color: isPos ? "rgb(52,211,153)" : "rgb(248,113,113)" }}>
                  {isPos ? "+" : ""}{pct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-slate-700 mt-3 text-center">
        Projection based on current holdings. Market prices assumed stable.
      </p>
    </div>
  );
}