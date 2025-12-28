/**
 * ExpenseHeatmap Component
 * Calendar heatmap showing daily expense intensity
 */

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, getDay } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Transaction } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { getCurrentDate } from '../../utils/dateUtils'

interface ExpenseHeatmapProps {
  transactions: Transaction[]
}

export default function ExpenseHeatmap({ transactions }: ExpenseHeatmapProps) {
  const today = parseISO(getCurrentDate())
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  // Get all days in current month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate expense per day
  const dailyExpenses = useMemo(() => {
    const expenses: Record<string, number> = {}
    
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const dateKey = tx.date.substring(0, 10)
        expenses[dateKey] = (expenses[dateKey] || 0) + tx.amount
      })
    
    return expenses
  }, [transactions])

  // Find max expense for color scaling
  const maxExpense = useMemo(() => {
    const values = Object.values(dailyExpenses)
    return values.length > 0 ? Math.max(...values) : 0
  }, [dailyExpenses])

  // Get intensity level (0-4)
  const getIntensity = (amount: number): number => {
    if (amount === 0 || maxExpense === 0) return 0
    const ratio = amount / maxExpense
    if (ratio < 0.25) return 1
    if (ratio < 0.5) return 2
    if (ratio < 0.75) return 3
    return 4
  }

  // Color classes based on intensity
  const intensityColors = [
    'bg-gray-100 dark:bg-gray-700',
    'bg-red-100 dark:bg-red-900/30',
    'bg-red-200 dark:bg-red-800/40',
    'bg-red-300 dark:bg-red-700/50',
    'bg-red-500 dark:bg-red-600',
  ]

  // Day names
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  // Get starting day offset
  const startDayOffset = getDay(monthStart)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Pola Pengeluaran - {format(today, 'MMMM yyyy', { locale: id })}
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span>Rendah</span>
          {intensityColors.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
          <span>Tinggi</span>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(day => (
          <div key={day} className="text-[10px] text-center text-gray-400 dark:text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Day cells */}
        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const expense = dailyExpenses[dateKey] || 0
          const intensity = getIntensity(expense)
          const isToday = dateKey === getCurrentDate()
          
          return (
            <div
              key={dateKey}
              className={`
                aspect-square rounded-sm flex items-center justify-center text-[10px] cursor-pointer
                transition-transform hover:scale-110 relative group
                ${intensityColors[intensity]}
                ${isToday ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
              `}
              title={`${format(day, 'd MMM')}: ${formatCurrency(expense)}`}
            >
              <span className={`
                ${intensity >= 3 ? 'text-white' : 'text-gray-600 dark:text-gray-300'}
                ${isToday ? 'font-bold' : ''}
              `}>
                {format(day, 'd')}
              </span>
              
              {/* Tooltip */}
              {expense > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {formatCurrency(expense)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Total: <span className="font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(Object.values(dailyExpenses).reduce((a, b) => a + b, 0))}
          </span>
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Rata-rata: <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(
              Object.values(dailyExpenses).length > 0
                ? Object.values(dailyExpenses).reduce((a, b) => a + b, 0) / Object.values(dailyExpenses).length
                : 0
            )}
          </span>/hari
        </span>
      </div>
    </div>
  )
}
