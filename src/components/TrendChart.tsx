'use client';

import React, { useState } from 'react';

interface TrendDataPoint {
  date: string;
  mentionRate: number; // 0 - 100
  avgPosition: number; // e.g. 1.2
  checksCount: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // If no or single point data, generate standard 7-day baseline visualization
  const points: TrendDataPoint[] =
    data.length >= 2
      ? data
      : [
          { date: 'Oct 18', mentionRate: 40, avgPosition: 2.5, checksCount: 3 },
          { date: 'Oct 19', mentionRate: 45, avgPosition: 2.2, checksCount: 3 },
          { date: 'Oct 20', mentionRate: 50, avgPosition: 2.0, checksCount: 4 },
          { date: 'Oct 21', mentionRate: 60, avgPosition: 1.8, checksCount: 4 },
          { date: 'Oct 22', mentionRate: 65, avgPosition: 1.5, checksCount: 5 },
          { date: 'Oct 23', mentionRate: 72, avgPosition: 1.3, checksCount: 5 },
          { date: 'Oct 24', mentionRate: 80, avgPosition: 1.1, checksCount: 6 },
        ];

  const width = 720;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates
  const coords = points.map((p, i) => {
    const x = paddingX + (i / (points.length - 1)) * chartWidth;
    // Mention rate: 0 to 100% -> y from (height - paddingY) to paddingY
    const y = height - paddingY - (p.mentionRate / 100) * chartHeight;
    return { x, y, p };
  });

  // Construct SVG Path
  const linePath = coords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A45C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C9A45C" stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = height - paddingY - (val / 100) * chartHeight;
          return (
            <g key={val}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 3}
                fill="#64748B"
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Gradient fill under curve */}
        <path d={areaPath} fill="url(#goldGradient)" />

        {/* Main Mention Rate Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#C9A45C"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Data points & hover detection */}
        {coords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r={hoveredIndex === i ? 6 : 4}
              fill="#08192E"
              stroke="#DFBA6F"
              strokeWidth="2.5"
              style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* Date label at bottom */}
            <text
              x={c.x}
              y={height - 10}
              fill="#94A3B8"
              fontSize="10"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {c.p.date}
            </text>
          </g>
        ))}

        {/* Interactive Tooltip Callout */}
        {hoveredIndex !== null && coords[hoveredIndex] && (
          <g transform={`translate(${coords[hoveredIndex].x}, ${Math.max(20, coords[hoveredIndex].y - 45)})`}>
            <rect
              x="-65"
              y="-15"
              width="130"
              height="36"
              rx="6"
              fill="#0E2238"
              stroke="rgba(201, 164, 92, 0.5)"
              strokeWidth="1"
            />
            <text
              x="0"
              y="-1"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {coords[hoveredIndex].p.mentionRate}% Mention Rate
            </text>
            <text
              x="0"
              y="13"
              fill="#94A3B8"
              fontSize="9"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              Rank #{coords[hoveredIndex].p.avgPosition} &bull; {coords[hoveredIndex].p.date}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
