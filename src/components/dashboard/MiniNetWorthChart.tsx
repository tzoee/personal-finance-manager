import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { NetWorthHistory } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MiniNetWorthChartProps {
  data: NetWorthHistory[]
  currentNetWorth: number
}

export default function MiniNetWorthChart({ data, currentNetWorth }: MiniNetWorthChartProps) {
  const formatMonth = (month: string) => {
    const [, m] = month.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return months[parseInt(m) - 1]
  }

  const chartData = data.map(d => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }))

  // Calculate trend
  const firstValue = data[0]?.netWorth || 0
  const lastValue = data[data.length - 1]?.netWorth || 0
  const change = lastValue - firstValue
  const changePercent = firstValue !== 0 ? (change / Math.abs(firstValue)) * 100 : 0
  const isPositive = change >= 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Trend Net Worth
        </h3>
        <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{changePercent.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Current Net Worth */}
      <p className={`text-xl font-bold mb-3 ${currentNetWorth >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-orange-600 dark:text-orange-400'}`}>
        {currentNetWorth < 0 ? '-' : ''}{formatCurrency(Math.abs(currentNetWorth))}
      </p>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="monthLabel" 
              tick={{ fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 9 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
              axisLine={false}
              tickLine={false}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
              labelFormatter={(label) => label}
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e5e7eb)',
                borderRadius: '8px',
                fontSize: '11px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="netWorth" 
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              fill="url(#netWorthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
