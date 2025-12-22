/**
 * ExpenseBreakdown Component
 * Breakdown pengeluaran dengan filter periode (minggu, bulan, tahun, custom)
 */

import { useState, useMemo } from 'react'
import { PieChart, Calendar, ChevronDown } from 'lucide-react'
import type { Transaction, Category } from '../../types'
import { formatCurrency } from '../../utils/formatters'

type PeriodType = 'week' | 'month' | 'year' | 'custom'

interface ExpenseBreakdownProps {
  transactions: Transaction[]
  categories: Category[]
}

interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  color: string
}

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

export default function ExpenseBreakdown({ transactions, categories }: ExpenseBreakdownProps) {
  const [period, setPeriod] = useState<PeriodType>('month')
  const [showPeriodMenu, setShowPeriodMenu] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date()
    let start: Date
    let end: Date = now

    switch (period) {
      case 'week':
        start = new Date(now)
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        break
      case 'custom':
        start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1)
        end = customEnd ? new Date(customEnd) : now
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }, [period, customStart, customEnd])

  // Filter and calculate breakdown
  const breakdown = useMemo((): CategoryBreakdown[] => {
    const expenseTransactions = transactions.filter(tx => 
      tx.type === 'expense' &&
      tx.date >= dateRange.start &&
      tx.date <= dateRange.end
    )

    const categoryTotals = new Map<string, number>()
    
    expenseTransactions.forEach(tx => {
      const current = categoryTotals.get(tx.categoryId) || 0
      categoryTotals.set(tx.categoryId, current + tx.amount)
    })

    const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0)

    const result: CategoryBreakdown[] = []
    let colorIndex = 0

    categoryTotals.forEach((amount, categoryId) => {
      const category = categories.find(c => c.id === categoryId)
      result.push({
        categoryId,
        categoryName: category?.name || 'Lainnya',
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: COLORS[colorIndex % COLORS.length]
      })
      colorIndex++
    })

    return result.sort((a, b) => b.amount - a.amount)
  }, [transactions, categories, dateRange])

  const totalExpense = breakdown.reduce((sum, item) => sum + item.amount, 0)

  const periodLabels: Record<PeriodType, string> = {
    week: '7 Hari Terakhir',
    month: 'Bulan Ini',
    year: 'Tahun Ini',
    custom: 'Custom'
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Breakdown Pengeluaran
        </h3>
        
        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 
                     rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{periodLabels[period]}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showPeriodMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 
                          rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              {(['week', 'month', 'year', 'custom'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p)
                    if (p !== 'custom') setShowPeriodMenu(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 
                            dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg
                            ${period === p ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : ''}`}
                >
                  {periodLabels[p]}
                </button>
              ))}
              
              {period === 'custom' && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Dari</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                               rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Sampai</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                               rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                  <button
                    onClick={() => setShowPeriodMenu(false)}
                    className="w-full px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Terapkan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {breakdown.length === 0 ? (
        <div className="text-center py-8">
          <PieChart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Belum ada pengeluaran di periode ini
          </p>
        </div>
      ) : (
        <>
          {/* Total */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          {/* Visual Bar Chart */}
          <div className="space-y-3 mb-4">
            {breakdown.slice(0, 5).map((item) => (
              <div key={item.categoryId}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                    {item.categoryName}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium ml-2">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>

          {/* Show more if > 5 categories */}
          {breakdown.length > 5 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              +{breakdown.length - 5} kategori lainnya
            </p>
          )}
        </>
      )}
    </div>
  )
}