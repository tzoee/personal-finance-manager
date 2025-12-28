/**
 * InteractivePieChart Component
 * Interactive donut chart for expense category breakdown
 */

import { useState, useMemo } from 'react'
import type { CategoryBreakdown } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface InteractivePieChartProps {
  data: CategoryBreakdown[]
  totalExpense: number
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

export default function InteractivePieChart({ data, totalExpense }: InteractivePieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Calculate pie segments
  const segments = useMemo(() => {
    let currentAngle = -90 // Start from top
    
    return data.slice(0, 8).map((item, index) => {
      const percentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0
      const angle = (percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      // Calculate path for arc
      const radius = 80
      const innerRadius = 50
      const centerX = 100
      const centerY = 100

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = centerX + radius * Math.cos(startRad)
      const y1 = centerY + radius * Math.sin(startRad)
      const x2 = centerX + radius * Math.cos(endRad)
      const y2 = centerY + radius * Math.sin(endRad)
      const x3 = centerX + innerRadius * Math.cos(endRad)
      const y3 = centerY + innerRadius * Math.sin(endRad)
      const x4 = centerX + innerRadius * Math.cos(startRad)
      const y4 = centerY + innerRadius * Math.sin(startRad)

      const largeArc = angle > 180 ? 1 : 0

      const path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
        Z
      `

      return {
        ...item,
        percentage,
        path,
        color: COLORS[index % COLORS.length],
        midAngle: (startAngle + endAngle) / 2,
      }
    })
  }, [data, totalExpense])

  const activeItem = selectedIndex !== null ? segments[selectedIndex] : 
                     hoveredIndex !== null ? segments[hoveredIndex] : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Distribusi Pengeluaran
      </h3>

      <div className="flex items-center gap-4">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <path
                key={segment.categoryId}
                d={segment.path}
                fill={segment.color}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
                  transform: (hoveredIndex === index || selectedIndex === index) 
                    ? 'scale(1.05)' 
                    : 'scale(1)',
                  transformOrigin: '100px 100px',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
              />
            ))}
            
            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400 text-[10px]"
            >
              Total
            </text>
            <text
              x="100"
              y="112"
              textAnchor="middle"
              className="fill-gray-900 dark:fill-gray-100 text-xs font-bold"
            >
              {formatCurrency(totalExpense).replace('Rp', '').trim()}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 max-h-[180px] overflow-y-auto">
          {segments.map((segment, index) => (
            <div
              key={segment.categoryId}
              className={`
                flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors
                ${selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
            >
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {segment.categoryName}
                </div>
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {segment.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel when item selected */}
      {activeItem && (
        <div 
          className="mt-3 p-3 rounded-lg border-l-4 transition-all"
          style={{ 
            borderColor: activeItem.color,
            backgroundColor: `${activeItem.color}10`
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {activeItem.categoryName}
            </span>
            <span className="text-sm font-bold" style={{ color: activeItem.color }}>
              {formatCurrency(activeItem.amount)}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {activeItem.percentage.toFixed(1)}% dari total pengeluaran
          </div>
        </div>
      )}
    </div>
  )
}
