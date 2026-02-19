"use client";

import React from "react";

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
  const radius = compact ? 80 : 100;
  const centerX = width / 2;
  const centerY = height / 2.5;

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-slate-400 text-sm">No data available</p>
      </div>
    );
  }

  // Calculate angles
  let currentAngle = -90; // Start from top
  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    // Label position
    const labelAngle = (startAngle + endAngle) / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelX = centerX + (radius * 0.65) * Math.cos(labelRad);
    const labelY = centerY + (radius * 0.65) * Math.sin(labelRad);

    const percentage = ((item.value / total) * 100).toFixed(1);

    currentAngle = endAngle;

    return {
      item,
      pathData,
      labelX,
      labelY,
      percentage,
      sliceAngle,
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={width} height={height} className="drop-shadow-lg">
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.pathData}
              fill={slice.item.color}
              stroke="rgb(15, 23, 42)"
              strokeWidth="2"
              className="transition-opacity hover:opacity-80 cursor-pointer"
            />
            {slice.sliceAngle > 35 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold fill-white pointer-events-none"
              >
                {slice.percentage}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {showLegend && (
        <div className={`w-full ${compact ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-3"}`}>
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: slice.item.color }}
              />
              <div className={compact ? "text-xs" : "text-sm"}>
                <p className="text-slate-100 font-medium">{slice.item.label}</p>
                {!compact && (
                  <p className="text-slate-400 text-xs">
                    {slice.item.value.toLocaleString()} EGP
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
