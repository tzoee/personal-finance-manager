/**
 * SparklineCard Component
 * Card with sparkline trend visualization
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Sparkline from './Sparkline'
import { formatCurrency } from '../../utils/formatters'

interface SparklineCardProps {
  title: string
  value: number
  data: number[]
  color?: string
  icon?: React.ReactNode
  format?: 'currency' | 'number' | 'percent'
}

export default function SparklineCard({
  title,
  value,
  data,
  color = '#3b82f6',
  icon,
  format = 'currency',
}: SparklineCardProps) {
  // Calculate trend
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0
  const trendPercent = data.length >= 2 && data[0] !== 0 
    ? ((data[data.length - 1] - data[0]) / Math.abs(data[0])) * 100 
    : 0

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percent':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString('id-ID')
    }
  }

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600 dark:text-green-400'
    if (trend < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700" style={{ color }}>
              {icon}
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">{title}</span>
        </div>
        
        {/* Trend indicator */}
        <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          <span>{trendPercent > 0 ? '+' : ''}{trendPercent.toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {formatValue(value)}
        </div>
        
        <Sparkline 
          data={data} 
          color={color}
          width={80}
          height={28}
          showArea={true}
        />
      </div>
    </div>
  )
}
