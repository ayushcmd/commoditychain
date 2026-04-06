"use client";

import { PricePoint } from "@/types";
import { getSparklinePath } from "@/lib/utils";

interface SparklineProps {
  data: PricePoint[];
  width?: number;
  height?: number;
  positive: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 40,
  positive,
  className = "",
}: SparklineProps) {
  const path = getSparklinePath(data, width, height);
  const color = positive ? "#22C55E" : "#EF4444";
  const fillId = `spark-fill-${positive ? "up" : "down"}`;

  if (!path) {
    return (
      <svg width={width} height={height} className={className} />
    );
  }

  const prices = data.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const lastY = height - ((prices[prices.length - 1] - min) / range) * height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={`${path}L${width},${height}L0,${height}Z`}
        fill={`url(#${fillId})`}
      />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Last price dot */}
      <circle
        cx={width}
        cy={lastY}
        r={2.5}
        fill={color}
      />
    </svg>
  );
}
