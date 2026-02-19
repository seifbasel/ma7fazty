"use client";

import React, { useState, useMemo } from "react";
import { Asset, Prices } from "@/types/asset";

interface MonthlyGrowthChartProps {
  assets: Asset[];
  prices: Prices;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TROY_OZ_TO_GRAMS = 31.1035;

/**
 * Calculate the projected EGP value of a single asset at a given future date.
 *
 * - cash:     fixed EGP value, no growth
 * - usd:      fixed units × current EGP rate (rate assumed stable)
 * - gold:     grams × price-per-gram at current purity (price assumed stable)
 * - silver:   grams × price-per-gram (price assumed stable)
 * - rent:     monthlyRent × months elapsed from startDate → targetDate
 * - interest simple:   P × (1 + r × t)          where t = years
 * - interest compound: P × (1 + r/12)^months    monthly compounding
 *
 * All dates are clamped to asset.endDate if set.
 */
function projectAssetValue(asset: Asset, prices: Prices, targetDate: Date): number {
  const start = asset.startDate
    ? new Date(asset.startDate)
    : new Date(asset.createdAt);
  const end = asset.endDate ? new Date(asset.endDate) : null;
  const effective = end && targetDate > end ? end : targetDate;

  switch (asset.type) {
    case "cash":
      return asset.amount;

    case "usd":
      return asset.amount * prices.usdToEgp;

    case "gold": {
      const purity = asset.purity ?? 24;
      const pricePerGram = (prices.gold.egp / TROY_OZ_TO_GRAMS) * (purity / 24);
      return asset.amount * pricePerGram;
    }

    case "silver": {
      const pricePerGram = prices.silver.egp / TROY_OZ_TO_GRAMS;
      return asset.amount * pricePerGram;
    }

    case "rent": {
      if (!asset.monthlyRent) return 0;
      const msPerMonth = 1000 * 60 * 60 * 24 * 30.4375;
      const monthsElapsed = Math.max(
        0,
        (effective.getTime() - start.getTime()) / msPerMonth
      );
      return asset.monthlyRent * monthsElapsed;
    }

    case "interest": {
      if (!asset.principal || !asset.interestRate) return 0;
      const P = asset.principal;
      const annualRate = asset.interestRate / 100;
      const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
      const yearsElapsed = Math.max(
        0,
        (effective.getTime() - start.getTime()) / msPerYear
      );
      if (asset.interestType === "compound") {
        const months = yearsElapsed * 12;
        return P * Math.pow(1 + annualRate / 12, months);
      }
      return P * (1 + annualRate * yearsElapsed);
    }

    default:
      return 0;
  }
}

/** Build 12 data points, one per month starting from next month. */
function buildProjection(assets: Asset[], prices: Prices, months = 12) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const value = assets.reduce(
      (sum, asset) => sum + projectAssetValue(asset, prices, targetDate),
      0
    );
    return {
      label: MONTHS[targetDate.getMonth()],
      year: targetDate.getFullYear(),
      value: Math.round(value),
      date: targetDate,
    };
  });
}

export default function MonthlyGrowthChart({ assets, prices }: MonthlyGrowthChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = useMemo(() => buildProjection(assets, prices, 12), [assets, prices]);

  const currentTotal = useMemo(
    () => assets.reduce((sum, a) => sum + projectAssetValue(a, prices, new Date()), 0),
    [assets, prices]
  );

  if (!assets.length) return null;

  /* ─── SVG geometry ─────────────────────────────────────────── */
  const W = 600;
  const H = 240;
  const PAD = { top: 28, right: 28, bottom: 44, left: 78 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Include "Now" as the leftmost reference point
  type ChartPoint = {
    x: number;
    y: number;
    value: number;
    label: string;
    year: number;
    isNow: boolean;
  };

  const allValues = [currentTotal, ...data.map((d) => d.value)];
  const minVal = Math.min(...allValues) * 0.97;
  const maxVal = Math.max(...allValues) * 1.02;
  const range = maxVal - minVal || 1;

  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / range) * chartH;

  const allPoints: ChartPoint[] = [
    {
      x: PAD.left,
      y: toY(currentTotal),
      value: Math.round(currentTotal),
      label: "Now",
      year: new Date().getFullYear(),
      isNow: true,
    },
    ...data.map((d, i) => ({
      x: PAD.left + ((i + 1) / data.length) * chartW,
      y: toY(d.value),
      value: d.value,
      label: d.label,
      year: d.year,
      isNow: false,
    })),
  ];

  // Smooth cubic bezier
  const linePath = allPoints.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = allPoints[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return path + ` C ${cpX} ${prev.y} ${cpX} ${pt.y} ${pt.x} ${pt.y}`;
  }, "");

  const areaPath =
    linePath +
    ` L ${allPoints[allPoints.length - 1].x} ${PAD.top + chartH}` +
    ` L ${allPoints[0].x} ${PAD.top + chartH} Z`;

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => minVal + (range * i) / 4);

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toFixed(0);
  };

  const finalValue = data[data.length - 1].value;
  const totalGrowth = finalValue - currentTotal;
  const totalGrowthPct =
    currentTotal > 0 ? ((totalGrowth / currentTotal) * 100).toFixed(1) : "0.0";
  const isPositive = totalGrowth >= 0;

  const hovered = hoveredIndex !== null ? allPoints[hoveredIndex] : null;

  /* ─── Render ────────────────────────────────────────────────── */
  return (
    <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-3xl p-6 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-lg">📈</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">12-Month Projection</p>
            <p className="text-xs text-slate-500">
              Estimated portfolio value — next 12 months
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}
            {fmt(totalGrowth)} EGP
          </p>
          <p className={`text-xs ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(Number(totalGrowthPct))}% over 12 months
          </p>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="mgArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="mgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <filter id="mgGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid + Y labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={toY(v)}
              x2={PAD.left + chartW}
              y2={toY(v)}
              stroke="rgba(148,163,184,0.07)"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={toY(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="rgb(71,85,105)"
            >
              {fmt(v)}
            </text>
          </g>
        ))}

        {/* "Now" dashed vertical */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + chartH}
          stroke="rgba(148,163,184,0.18)"
          strokeDasharray="3 3"
        />

        {/* Area + Line */}
        <path d={areaPath} fill="url(#mgArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#mgLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X labels + hover hit areas */}
        {allPoints.map((pt, i) => (
          <g key={i}>
            <text
              x={pt.x}
              y={PAD.top + chartH + 18}
              textAnchor="middle"
              fontSize="10"
              fontWeight={pt.isNow ? "700" : "400"}
              fill={
                hoveredIndex === i
                  ? "rgb(52,211,153)"
                  : pt.isNow
                  ? "rgb(148,163,184)"
                  : "rgb(71,85,105)"
              }
            >
              {pt.label}
            </text>
            {/* Show year under Jan or first point */}
            {(pt.label === "Jan" || i === 0) && (
              <text
                x={pt.x}
                y={PAD.top + chartH + 32}
                textAnchor="middle"
                fontSize="8"
                fill="rgb(51,65,85)"
              >
                {pt.year}
              </text>
            )}
            <rect
              x={i === 0 ? pt.x - 20 : pt.x - chartW / (allPoints.length * 2)}
              y={PAD.top}
              width={i === 0 ? 40 : chartW / allPoints.length}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              style={{ cursor: "crosshair" }}
            />
          </g>
        ))}

        {/* Hover UI */}
        {hovered && (
          <g>
            <line
              x1={hovered.x}
              y1={PAD.top}
              x2={hovered.x}
              y2={PAD.top + chartH}
              stroke="rgba(52,211,153,0.2)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <circle cx={hovered.x} cy={hovered.y} r="6" fill="#10b981" filter="url(#mgGlow)" />
            <circle cx={hovered.x} cy={hovered.y} r="3" fill="white" />

            {/* Tooltip */}
            {(() => {
              const growthFromNow = hovered.isNow ? null : hovered.value - currentTotal;
              const growthPct =
                growthFromNow !== null && currentTotal > 0
                  ? ((growthFromNow / currentTotal) * 100).toFixed(1)
                  : null;
              const prevPt = hoveredIndex! > 0 ? allPoints[hoveredIndex! - 1] : null;
              const momChange = prevPt ? hovered.value - prevPt.value : null;

              const lines = [
                { text: hovered.isNow ? "Today" : `${hovered.label} ${hovered.year}`, color: "rgb(100,116,139)", size: 10 },
                { text: `${hovered.value.toLocaleString()} EGP`, color: "white", size: 12, bold: true },
                ...(growthFromNow !== null
                  ? [{
                      text: `${growthFromNow >= 0 ? "+" : ""}${fmt(growthFromNow)} EGP from now (${growthFromNow >= 0 ? "+" : ""}${growthPct}%)`,
                      color: growthFromNow >= 0 ? "rgb(52,211,153)" : "rgb(248,113,113)",
                      size: 9,
                    }]
                  : []),
                ...(momChange !== null && !hovered.isNow
                  ? [{
                      text: `${momChange >= 0 ? "+" : ""}${fmt(momChange)} vs prev month`,
                      color: momChange >= 0 ? "rgb(52,211,153)" : "rgb(248,113,113)",
                      size: 9,
                    }]
                  : []),
              ];

              const ttW = 170;
              const ttH = 18 + lines.length * 16;
              const ttX = Math.min(Math.max(hovered.x - ttW / 2, PAD.left), PAD.left + chartW - ttW);
              const ttY = hovered.y - ttH - 12;

              return (
                <g>
                  <rect x={ttX} y={ttY} width={ttW} height={ttH} rx="8" fill="rgb(2,6,23)" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
                  {lines.map((l, li) => (
                    <text
                      key={li}
                      x={ttX + 10}
                      y={ttY + 14 + li * 16}
                      fontSize={l.size}
                      fontWeight={(l as any).bold ? "700" : "400"}
                      fill={l.color}
                    >
                      {l.text}
                    </text>
                  ))}
                </g>
              );
            })()}
          </g>
        )}

        {/* Static dots */}
        {allPoints.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={pt.isNow ? 4 : 2.5}
            fill={pt.isNow ? "rgb(100,116,139)" : "#10b981"}
            opacity={hoveredIndex === i ? 0 : 0.65}
            style={{ pointerEvents: "none" }}
          />
        ))}
      </svg>

      {/* Month-over-month strip */}
      <div className="mt-2 pt-4 border-t border-slate-800/60">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-semibold">
          Month-over-month growth
        </p>
        <div className="flex gap-1">
          {data.map((d, i) => {
            const prev = i === 0 ? currentTotal : data[i - 1].value;
            const change = d.value - prev;
            const pct = prev > 0 ? ((change / prev) * 100).toFixed(1) : "0.0";
            const isPos = change >= 0;
            return (
              <div
                key={i}
                className="flex-1 text-center px-0.5 py-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor:
                    hoveredIndex === i + 1
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(255,255,255,0.02)",
                }}
              >
                <p className="text-[9px] text-slate-600 mb-0.5">{d.label}</p>
                <p
                  className="text-[9px] font-bold"
                  style={{ color: isPos ? "rgb(52,211,153)" : "rgb(248,113,113)" }}
                >
                  {isPos ? "+" : ""}{pct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-slate-700 mt-3 text-center">
        Projection based on current holdings. Market prices (gold, silver, USD) assumed stable. Rent &amp; interest calculated from their start dates.
      </p>
    </div>
  );
}