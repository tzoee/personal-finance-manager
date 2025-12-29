import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import type { NetWorthHistory } from '../../types'

interface TrendsTabProps {
  netWorthHistory: NetWorthHistory[]
  currentNetWorth: number
}

export default function TrendsTab({ netWorthHistory, currentNetWorth }: TrendsTabProps) {
  const data = netWorthHistory.slice(-6)
  
  // Calculate trend
  const firstValue = data[0]?.netWorth || 0
  const lastValue = data[data.length - 1]?.netWorth || currentNetWorth
  const change = lastValue - firstValue
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0

  const maxValue = Math.max(...data.map(d => Math.max(d.assets, d.liabilities, Math.abs(d.netWorth))))
  const minValue = Math.min(...data.map(d => d.netWorth))
  const range = maxValue - minValue || 1

  // Generate SVG path for net worth line
  const generatePath = () => {
    if (data.length < 2) return ''
    
    const width = 280
    const height = 80
    const padding = 10
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((d.netWorth - minValue) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  return (
    <div className="space-y-4">
      {/* Net Worth Trend Summary */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tren 6 Bulan</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(currentNetWorth)}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
          change > 0 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : change < 0
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {change > 0 ? <TrendingUp className="w-4 h-4" /> : 
           change < 0 ? <TrendingDown className="w-4 h-4" /> : 
           <Minus className="w-4 h-4" />}
          <span>{change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%</span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="relative">
        <svg viewBox="0 0 280 80" className="w-full h-20">
          {/* Grid lines */}
          <line x1="10" y1="70" x2="270" y2="70" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="10" y1="40" x2="270" y2="40" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="10" y1="10" x2="270" y2="10" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
          
          {/* Net Worth Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="rgb(var(--color-primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = 10 + (i / (data.length - 1)) * 260
            const y = 70 - ((d.netWorth - minValue) / range) * 60
            return (
              <circle
                key={d.month}
                cx={x}
                cy={y}
                r="3"
                fill="rgb(var(--color-primary))"
              />
            )
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between px-2 mt-1">
          {data.map((d) => (
            <span key={d.month} className="text-[10px] text-gray-400">
              {d.month.split('-')[1]}
            </span>
          ))}
        </div>
      </div>

      {/* Assets vs Liabilities */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Total Aset</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(data[data.length - 1]?.assets || 0)}
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-100 dark:border-rose-800/30">
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Total Liabilitas</p>
          <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
            {formatCurrency(data[data.length - 1]?.liabilities || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
