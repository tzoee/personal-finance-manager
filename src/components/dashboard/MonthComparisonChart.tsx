/**
 * MonthComparisonChart Component
 * Side-by-side comparison of current vs previous month
 */

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { format, subMonths, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { getCurrentDate } from '../../utils/dateUtils'

interface ComparisonItem {
  label: string
  current: number
  previous: number
  type: 'income' | 'expense' | 'surplus'
}

interface MonthComparisonChartProps {
  currentIncome: number
  currentExpense: number
  previousIncome: number
  previousExpense: number
}

export default function MonthComparisonChart({
  currentIncome,
  currentExpense,
  previousIncome,
  previousExpense,
}: MonthComparisonChartProps) {
  const today = parseISO(getCurrentDate())
  const currentMonth = format(today, 'MMM', { locale: id })
  const previousMonth = format(subMonths(today, 1), 'MMM', { locale: id })

  const items: ComparisonItem[] = useMemo(() => [
    {
      label: 'Pemasukan',
      current: currentIncome,
      previous: previousIncome,
      type: 'income',
    },
    {
      label: 'Pengeluaran',
      current: currentExpense,
      previous: previousExpense,
      type: 'expense',
    },
    {
      label: 'Surplus',
      current: currentIncome - currentExpense,
      previous: previousIncome - previousExpense,
      type: 'surplus',
    },
  ], [currentIncome, currentExpense, previousIncome, previousExpense])

  const getChangeInfo = (current: number, previous: number, type: string) => {
    const change = current - previous
    const percentChange = previous !== 0 ? (change / Math.abs(previous)) * 100 : (current !== 0 ? 100 : 0)
    
    // For expense, decrease is good. For income/surplus, increase is good
    const isPositive = type === 'expense' ? change < 0 : change > 0
    const isNeutral = change === 0

    return { percentChange, isPositive, isNeutral }
  }

  const getBarWidth = (value: number, maxValue: number) => {
    if (maxValue === 0) return 0
    return Math.min(100, (Math.abs(value) / maxValue) * 100)
  }

  const maxValue = useMemo(() => {
    const allValues = items.flatMap(item => [Math.abs(item.current), Math.abs(item.previous)])
    return Math.max(...allValues, 1)
  }, [items])

  const typeColors = {
    income: {
      current: 'bg-green-500',
      previous: 'bg-green-300',
      text: 'text-green-600 dark:text-green-400',
    },
    expense: {
      current: 'bg-red-500',
      previous: 'bg-red-300',
      text: 'text-red-600 dark:text-red-400',
    },
    surplus: {
      current: 'bg-blue-500',
      previous: 'bg-blue-300',
      text: 'text-blue-600 dark:text-blue-400',
    },
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Perbandingan Bulanan
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
            {previousMonth}
          </span>
          <ArrowRight className="w-3 h-3" />
          <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded font-medium">
            {currentMonth}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const { percentChange, isPositive, isNeutral } = getChangeInfo(
            item.current, 
            item.previous, 
            item.type
          )
          const colors = typeColors[item.type]

          return (
            <div key={item.label} className="space-y-2">
              {/* Label and change indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <div className={`
                  flex items-center gap-1 text-xs font-medium
                  ${isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                `}>
                  {isNeutral ? (
                    <Minus className="w-3 h-3" />
                  ) : isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isNeutral ? '0%' : `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}%`}
                  </span>
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-1">
                {/* Previous month bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-8">{previousMonth}</span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.previous} rounded-full transition-all duration-500`}
                      style={{ width: `${getBarWidth(item.previous, maxValue)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 w-20 text-right">
                    {formatCurrency(item.previous)}
                  </span>
                </div>

                {/* Current month bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 dark:text-gray-300 w-8 font-medium">{currentMonth}</span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.current} rounded-full transition-all duration-500`}
                      style={{ width: `${getBarWidth(item.current, maxValue)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] w-20 text-right font-medium ${colors.text}`}>
                    {formatCurrency(item.current)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Perubahan Surplus</span>
          {(() => {
            const surplusCurrent = currentIncome - currentExpense
            const surplusPrevious = previousIncome - previousExpense
            const surplusChange = surplusCurrent - surplusPrevious
            const isPositive = surplusChange >= 0

            return (
              <span className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? '+' : ''}{formatCurrency(surplusChange)}
              </span>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
