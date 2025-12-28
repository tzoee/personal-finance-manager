/**
 * Sparkline Component
 * Mini trend chart for compact data visualization
 */

import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
  showDots?: boolean
  showArea?: boolean
  className?: string
}

export default function Sparkline({
  data,
  color = '#3b82f6',
  height = 32,
  width = 100,
  showDots = false,
  showArea = true,
  className = '',
}: SparklineProps) {
  const { path, areaPath, points } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', areaPath: '', points: [] }
    }

    const minVal = Math.min(...data)
    const maxVal = Math.max(...data)
    const range = maxVal - minVal || 1
    const padding = 4

    const effectiveHeight = height - padding * 2
    const effectiveWidth = width - padding * 2
    const stepX = effectiveWidth / (data.length - 1 || 1)

    const pts = data.map((value, index) => ({
      x: padding + index * stepX,
      y: padding + effectiveHeight - ((value - minVal) / range) * effectiveHeight,
      value,
    }))

    // Create smooth curve path using quadratic bezier
    let linePath = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const midX = (prev.x + curr.x) / 2
      linePath += ` Q ${prev.x + (midX - prev.x) * 0.5} ${prev.y}, ${midX} ${(prev.y + curr.y) / 2}`
      linePath += ` Q ${midX + (curr.x - midX) * 0.5} ${curr.y}, ${curr.x} ${curr.y}`
    }

    // Area path (for fill)
    const area = `${linePath} L ${pts[pts.length - 1].x} ${height - padding} L ${pts[0].x} ${height - padding} Z`

    return {
      path: linePath,
      areaPath: area,
      points: pts,
    }
  }, [data, height, width])

  if (data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ width, height }}
      >
        No data
      </div>
    )
  }

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
        />
      )}

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots && points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="2"
          fill={color}
        />
      ))}

      {/* End dot (always show) */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      )}
    </svg>
  )
}
