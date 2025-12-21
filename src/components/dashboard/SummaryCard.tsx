import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface SummaryCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  valueColor?: string
  showTrend?: boolean
  trendValue?: number
  format?: 'currency' | 'percentage' | 'number'
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary-600 dark:text-primary-400',
  iconBgColor = 'bg-primary-100 dark:bg-primary-900/30',
  valueColor = 'text-gray-900 dark:text-gray-100',
  showTrend = false,
  trendValue = 0,
  format = 'currency',
}: SummaryCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(Math.abs(value))
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'number':
        return value.toLocaleString('id-ID')
      default:
        return value.toString()
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <div className="flex items-center gap-2">
            <p className={`text-xl font-bold ${valueColor}`}>
              {value < 0 && format === 'currency' ? '-' : ''}
              {formatValue()}
            </p>
            {showTrend && trendValue !== 0 && (
              <div className={`flex items-center gap-0.5 text-sm ${
                trendValue > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(trendValue).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
