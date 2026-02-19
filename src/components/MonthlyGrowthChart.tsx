"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { Asset, Prices } from "@/types/asset";

interface MonthlyGrowthChartProps {
  assets: Asset[];
  prices: Prices;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TROY_OZ_TO_GRAMS = 31.1035;

function projectAssetValue(asset: Asset, prices: Prices, targetDate: Date): number {
  const start = asset.startDate ? new Date(asset.startDate) : new Date(asset.createdAt);
  const end = asset.endDate ? new Date(asset.endDate) : null;
  const effective = end && targetDate > end ? end : targetDate;

  switch (asset.type) {
    case "cash":
      return asset.amount;
    case "usd":
      return asset.amount * prices.usdToEgp;
    case "gold": {
      const purity = asset.purity ?? 24;
      return asset.amount * (prices.gold.egp / TROY_OZ_TO_GRAMS) * (purity / 24);
    }
    case "silver":
      return asset.amount * (prices.silver.egp / TROY_OZ_TO_GRAMS);
    case "rent": {
      if (!asset.monthlyRent) return 0;
      const monthsElapsed = Math.max(0, (effective.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
      return asset.monthlyRent * monthsElapsed;
    }
    case "interest": {
      if (!asset.principal || !asset.interestRate) return 0;
      const P = asset.principal;
      const r = asset.interestRate / 100;
      const yearsElapsed = Math.max(0, (effective.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (asset.interestType === "compound") return P * Math.pow(1 + r / 12, yearsElapsed * 12);
      return P * (1 + r * yearsElapsed);
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
    return { label: MONTHS[targetDate.getMonth()], year: targetDate.getFullYear(), value: Math.round(value), date: targetDate };
  });
}

const fmt = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
};

const fmtFull = (v: number) => v.toLocaleString();

export default function MonthlyGrowthChart({ assets, prices }: MonthlyGrowthChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => buildProjection(assets, prices, 12), [assets, prices]);
  const currentTotal = useMemo(
    () => assets.reduce((sum, a) => sum + projectAssetValue(a, prices, new Date()), 0),
    [assets, prices]
  );

  if (!assets.length) return null;

  // Responsive viewBox — wider/taller logic handled by aspect ratio
  const W = 560;
  const H = 220;
  const PAD = { top: 24, right: 16, bottom: 40, left: 64 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  type ChartPoint = { x: number; y: number; value: number; label: string; year: number; isNow: boolean };

  const allValues = [currentTotal, ...data.map((d) => d.value)];
  const minVal = Math.min(...allValues) * 0.97;
  const maxVal = Math.max(...allValues) * 1.02;
  const range = maxVal - minVal || 1;
  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / range) * chartH;

  const allPoints: ChartPoint[] = [
    { x: PAD.left, y: toY(currentTotal), value: Math.round(currentTotal), label: "Now", year: new Date().getFullYear(), isNow: true },
    ...data.map((d, i) => ({
      x: PAD.left + ((i + 1) / data.length) * chartW,
      y: toY(d.value),
      value: d.value,
      label: d.label,
      year: d.year,
      isNow: false,
    })),
  ];

  const linePath = allPoints.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = allPoints[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return path + ` C ${cpX} ${prev.y} ${cpX} ${pt.y} ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = linePath + ` L ${allPoints[allPoints.length - 1].x} ${PAD.top + chartH} L ${allPoints[0].x} ${PAD.top + chartH} Z`;
  const yTicks = Array.from({ length: 4 }, (_, i) => minVal + (range * i) / 3);

  const finalValue = data[data.length - 1].value;
  const totalGrowth = finalValue - currentTotal;
  const totalGrowthPct = currentTotal > 0 ? ((totalGrowth / currentTotal) * 100).toFixed(1) : "0.0";
  const isPositive = totalGrowth >= 0;

  const hovered = hoveredIndex !== null ? allPoints[hoveredIndex] : null;

  // Touch handler — find nearest point from touch X position
  const handleTouch = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    // Scale from rendered width to viewBox width
    const scaleX = W / rect.width;
    const svgX = touchX * scaleX;

    // Find closest point
    let closest = 0;
    let minDist = Infinity;
    allPoints.forEach((pt, i) => {
      const dist = Math.abs(pt.x - svgX);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setHoveredIndex(closest);
  }, [allPoints]);

  const handleTouchEnd = useCallback(() => setHoveredIndex(null), []);

  // Tooltip positioning — clamp within chart
  const getTooltip = () => {
    if (!hovered || hoveredIndex === null) return null;
    const growthFromNow = hovered.isNow ? null : hovered.value - currentTotal;
    const growthPct = growthFromNow !== null && currentTotal > 0
      ? ((growthFromNow / currentTotal) * 100).toFixed(1) : null;
    const prevPt = hoveredIndex > 0 ? allPoints[hoveredIndex - 1] : null;
    const momChange = prevPt ? hovered.value - prevPt.value : null;

    const lines = [
      { text: hovered.isNow ? "Today" : `${hovered.label} ${hovered.year}`, color: "rgb(100,116,139)", size: 9, bold: false },
      { text: `${fmtFull(hovered.value)} EGP`, color: "white", size: 11, bold: true },
      ...(growthFromNow !== null ? [{
        text: `${growthFromNow >= 0 ? "+" : ""}${fmt(growthFromNow)} from now (${growthFromNow >= 0 ? "+" : ""}${growthPct}%)`,
        color: growthFromNow >= 0 ? "rgb(52,211,153)" : "rgb(248,113,113)", size: 8, bold: false,
      }] : []),
      ...(momChange !== null && !hovered.isNow ? [{
        text: `${momChange >= 0 ? "+" : ""}${fmt(momChange)} vs prev`,
        color: momChange >= 0 ? "rgb(52,211,153)" : "rgb(248,113,113)", size: 8, bold: false,
      }] : []),
    ];

    const ttW = 155;
    const ttH = 14 + lines.length * 15;
    const ttX = Math.min(Math.max(hovered.x - ttW / 2, PAD.left), PAD.left + chartW - ttW);
    // Show above the dot, but clamp so it doesn't go above viewBox
    const ttY = Math.max(4, hovered.y - ttH - 10);

    return { lines, ttW, ttH, ttX, ttY };
  };

  const tooltip = getTooltip();

  return (
    <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-3xl p-4 sm:p-6 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <span className="text-base sm:text-lg">📈</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">12-Month Projection</p>
            <p className="text-xs text-slate-500 hidden sm:block">Estimated portfolio value — next 12 months</p>
            <p className="text-xs text-slate-500 sm:hidden">Next 12 months</p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className={`text-sm font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{fmt(totalGrowth)} EGP
          </p>
          <p className={`text-xs ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(Number(totalGrowthPct))}%
          </p>
        </div>
      </div>

      {/* SVG — responsive via viewBox + width 100% */}
      <div className="w-full touch-none select-none">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          onMouseLeave={() => setHoveredIndex(null)}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onTouchEnd={handleTouchEnd}
          style={{ display: "block", overflow: "visible", touchAction: "none" }}
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
            <filter id="mgGlow" x="-50%" y="-50%" width="200%" height="200%">
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

          {/* "Now" marker */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH} stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />

          {/* Area + Line */}
          <path d={areaPath} fill="url(#mgArea)" />
          <path d={linePath} fill="none" stroke="url(#mgLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* X-axis labels — skip alternating on small viewBox */}
          {allPoints.map((pt, i) => {
            // On mobile viewBox show every other label (skip odd indices except Now and last)
            const skip = i !== 0 && i !== allPoints.length - 1 && i % 2 === 0;
            return (
              <g key={i}>
                {!skip && (
                  <text
                    x={pt.x}
                    y={PAD.top + chartH + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight={pt.isNow ? "700" : "400"}
                    fill={hoveredIndex === i ? "rgb(52,211,153)" : pt.isNow ? "rgb(148,163,184)" : "rgb(71,85,105)"}
                  >
                    {pt.label}
                  </text>
                )}
                {(pt.label === "Jan" || i === 0) && (
                  <text x={pt.x} y={PAD.top + chartH + 28} textAnchor="middle" fontSize="7" fill="rgb(51,65,85)">
                    {pt.year}
                  </text>
                )}
                {/* Hit area for mouse */}
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
            );
          })}

          {/* Hover crosshair + dot */}
          {hovered && (
            <g>
              <line x1={hovered.x} y1={PAD.top} x2={hovered.x} y2={PAD.top + chartH} stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="4 3" />
              <circle cx={hovered.x} cy={hovered.y} r="7" fill="#10b981" filter="url(#mgGlow)" />
              <circle cx={hovered.x} cy={hovered.y} r="3.5" fill="white" />
            </g>
          )}

          {/* Tooltip */}
          {tooltip && hovered && (
            <g>
              <rect x={tooltip.ttX} y={tooltip.ttY} width={tooltip.ttW} height={tooltip.ttH} rx="7" fill="rgb(2,6,23)" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
              {tooltip.lines.map((l, li) => (
                <text key={li} x={tooltip.ttX + 8} y={tooltip.ttY + 12 + li * 15} fontSize={l.size} fontWeight={l.bold ? "700" : "400"} fill={l.color}>
                  {l.text}
                </text>
              ))}
            </g>
          )}

          {/* Static dots */}
          {allPoints.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r={pt.isNow ? 4 : 2.5} fill={pt.isNow ? "rgb(100,116,139)" : "#10b981"} opacity={hoveredIndex === i ? 0 : 0.65} style={{ pointerEvents: "none" }} />
          ))}
        </svg>
      </div>

      {/* Touch hint — only on mobile */}
      <p className="text-[10px] text-slate-700 text-center mt-1 sm:hidden">
        Touch &amp; drag to explore
      </p>

      {/* Month-over-month strip — scrollable on mobile */}
      <div className="mt-3 pt-3 border-t border-slate-800/60">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-semibold">
          Month-over-month
        </p>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {data.map((d, i) => {
            const prev = i === 0 ? currentTotal : data[i - 1].value;
            const change = d.value - prev;
            const pct = prev > 0 ? ((change / prev) * 100).toFixed(1) : "0.0";
            const isPos = change >= 0;
            return (
              <div
                key={i}
                className="shrink-0 w-10 sm:flex-1 sm:w-auto text-center px-0.5 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: hoveredIndex === i + 1 ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)" }}
              >
                <p className="text-[9px] text-slate-600 mb-0.5">{d.label}</p>
                <p className="text-[9px] font-bold" style={{ color: isPos ? "rgb(52,211,153)" : "rgb(248,113,113)" }}>
                  {isPos ? "+" : ""}{pct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-slate-700 mt-3 text-center leading-relaxed">
        Projection based on current holdings. Market prices assumed stable.
      </p>
    </div>
  );
}