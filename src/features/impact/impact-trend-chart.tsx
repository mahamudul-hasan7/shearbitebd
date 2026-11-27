"use client";

import { useState } from "react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { NGOImpactAnalytics } from "@/services";

export function ImpactTrendChart({ points }: { points: NGOImpactAnalytics["trend"] }) {
  const tx = useUiText();
  const [hovered, setHovered] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-muted-600">
        {tx("No completed distributions in this period.")}
      </p>
    );
  }

  const width = 560;
  const height = 220;
  const padX = 36;
  const padTop = 28;
  const padBottom = 34;
  const maxMeals = Math.max(...points.map((point) => point.meals), 1);

  const coords = points.map((point, index) => {
    const x = points.length === 1
      ? width / 2
      : padX + (index * (width - padX * 2)) / (points.length - 1);
    const y = height - padBottom - (point.meals / maxMeals) * (height - padTop - padBottom);
    return { x, y, ...point };
  });

  const linePath = coords
    .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");
  const areaPath = coords.length > 1
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padBottom} L ${coords[0].x.toFixed(1)} ${height - padBottom} Z`
    : "";

  const active = hovered !== null ? coords[hovered] : coords[coords.length - 1];

  return (
    <div className="space-y-3" role="img" aria-label={tx("Meals distributed over time")}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50/70 px-3.5 py-2 text-xs">
        <span className="font-semibold text-emerald-900">
          {active.label}: <strong>{active.meals}</strong> {tx("meals")} ·{" "}
          <strong>{(active.meals * 1.25).toFixed(1)} kg</strong> CO₂e
        </span>
        <span className="text-muted-600">{tx("Hover points for breakdown")}</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full overflow-visible">
        <defs>
          <linearGradient id="sharebite-impact-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padBottom - ratio * (height - padTop - padBottom);
          return (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          );
        })}

        {areaPath && <path d={areaPath} fill="url(#sharebite-impact-area)" />}
        {coords.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {coords.map((pt, index) => {
          const isActive = hovered === index || (hovered === null && index === coords.length - 1);
          return (
            <g
              key={`${pt.label}-${index}`}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 7 : 5}
                fill={isActive ? "#047857" : "#10b981"}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                fill="#065f46"
                fontSize="11"
                fontWeight="700"
              >
                {pt.meals}
              </text>
              <text
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                fill="#64748b"
                fontSize="11"
                fontWeight="600"
              >
                {pt.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
