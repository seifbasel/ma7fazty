"use client";

import React, { useState } from "react";

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  compact?: boolean;
}

export default function PieChart({
  data,
  width = 380,
  height = 320,
  showLegend = true,
  compact = true,
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Larger radius when compact=false
  const radius = compact ? 85 : 118;
  const innerRadius = radius * 0.54;
  const centerX = width / 2;
  const centerY = compact ? height / 2.2 : height / 2.3;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-slate-500 text-sm">No data available</p>
      </div>
    );
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let currentAngle = -90;
  const slices = data.map((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const midAngle = (startAngle + endAngle) / 2;
    const midRad = toRad(midAngle);

    const isHovered = hoveredIndex === index;
    const expand = isHovered ? 8 : 0;
    const offsetX = expand * Math.cos(midRad);
    const offsetY = expand * Math.sin(midRad);
    const outerR = radius + (isHovered ? 6 : 0);

    const pts = (r: number, angle: number) => ({
      x: centerX + r * Math.cos(toRad(angle)) + offsetX,
      y: centerY + r * Math.sin(toRad(angle)) + offsetY,
    });

    const s1 = pts(outerR, startAngle);
    const e1 = pts(outerR, endAngle);
    const s2 = pts(innerRadius, startAngle);
    const e2 = pts(innerRadius, endAngle);
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${s2.x} ${s2.y}`,
      `L ${s1.x} ${s1.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
      `L ${e2.x} ${e2.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${s2.x} ${s2.y}`,
      "Z",
    ].join(" ");

    const labelR = (outerR + innerRadius) / 2;
    const labelPt = pts(labelR, midAngle);
    const percentage = ((item.value / total) * 100).toFixed(1);

    currentAngle = endAngle;
    return { item, pathData, labelPt, percentage, sliceAngle, isHovered };
  });

  const hovered = hoveredIndex !== null ? slices[hoveredIndex] : null;

  const fmtShort = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toFixed(0);
  };

  const labelFontSize = compact ? "10" : "12";
  const centerFontLarge = compact ? "15" : "18";
  const centerFontSmall = compact ? "10" : "11";
  const centerFontValue = compact ? "9" : "10";

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <defs>
          {slices.map((_, i) => (
            <filter key={i} id={`pc-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Slices */}
        {slices.map((slice, index) => (
          <g
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ cursor: "pointer" }}
          >
            <path
              d={slice.pathData}
              fill={slice.item.color}
              stroke="rgb(2,6,23)"
              strokeWidth="2"
              filter={slice.isHovered ? `url(#pc-glow-${index})` : undefined}
              opacity={hoveredIndex !== null && !slice.isHovered ? 0.45 : 1}
              style={{ transition: "opacity 0.2s ease" }}
            />
            {slice.sliceAngle > 25 && (
              <text
                x={slice.labelPt.x}
                y={slice.labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={slice.isHovered ? String(Number(labelFontSize) + 2) : labelFontSize}
                fontWeight="700"
                fill="rgba(255,255,255,0.92)"
                style={{ pointerEvents: "none" }}
              >
                {slice.percentage}%
              </text>
            )}
          </g>
        ))}

        {/* Donut hole */}
        <circle cx={centerX} cy={centerY} r={innerRadius - 3} fill="rgb(2,6,23)" />

        {/* Center content */}
        {hovered ? (
          <>
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius - 3}
              fill="none"
              stroke={hovered.item.color}
              strokeWidth="1.5"
              opacity="0.35"
            />
            <text
              x={centerX}
              y={centerY - 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={centerFontSmall}
              fill="rgb(148,163,184)"
              fontWeight="500"
            >
              {hovered.item.label.replace(/^\S+\s/, "")}
            </text>
            <text
              x={centerX}
              y={centerY - 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={centerFontLarge}
              fontWeight="800"
              fill="white"
            >
              {hovered.percentage}%
            </text>
            <text
              x={centerX}
              y={centerY + 18}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={centerFontValue}
              fill="rgb(100,116,139)"
            >
              {fmtShort(hovered.item.value)} EGP
            </text>
          </>
        ) : (
          <>
            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={centerFontSmall}
              fill="rgb(100,116,139)"
              letterSpacing="0.5"
            >
              PORTFOLIO
            </text>
            <text
              x={centerX}
              y={centerY + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={compact ? "13" : "15"}
              fontWeight="700"
              fill="rgb(148,163,184)"
            >
              {data.length} {data.length === 1 ? "type" : "types"}
            </text>
          </>
        )}
      </svg>

      {showLegend && (
        <div className="w-full space-y-1">
          {slices.map((slice, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all duration-150"
              style={{
                backgroundColor:
                  hoveredIndex === index ? `${slice.item.color}18` : "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0 transition-shadow duration-200"
                  style={{
                    backgroundColor: slice.item.color,
                    boxShadow: hoveredIndex === index ? `0 0 8px ${slice.item.color}` : "none",
                  }}
                />
                <p className="text-xs text-slate-400 font-medium">{slice.item.label}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-600 tabular-nums">
                  {slice.item.value.toLocaleString()} EGP
                </p>
                <p
                  className="text-xs font-bold tabular-nums w-10 text-right"
                  style={{ color: slice.item.color }}
                >
                  {slice.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}