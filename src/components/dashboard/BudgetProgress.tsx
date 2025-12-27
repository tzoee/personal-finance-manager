/**
 * BudgetProgress Component
 * Circular progress ring showing budget vs actual spending
 */

import { useMemo } from 'react'
import { TrendingDown, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface BudgetProgressProps {
  budget: number
  actual: number
  label?: string
}

export default function BudgetProgress({ budget, actual, label = 'Budget Bulan Ini' }: BudgetProgressProps) {
  const percentage = useMemo(() => {
    if (budget <= 0) return 0
    return Math.min((actual / budget) * 100, 100)
  }, [budget, actual])

  const isOverBudget = actual > budget
  const remaining = budget - actual
  
  // Calculate stroke properties for the ring
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on percentage
  const getColor = () => {
    if (isOverBudget) return { stroke: '#ef4444', bg: 'text-red-500', light: 'text-red-100' }
    if (percentage >= 80) return { stroke: '#f59e0b', bg: 'text-amber-500', light: 'text-amber-100' }
    if (percentage >= 50) return { stroke: '#3b82f6', bg: 'text-blue-500', light: 'text-blue-100' }
    return { stroke: '#22c55e', bg: 'text-green-500', light: 'text-green-100' }
  }

  const colors = getColor()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {label}
      </h3>
      
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold ${colors.bg}`}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400">terpakai</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Budget</span>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(budget)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Terpakai</span>
            <span className={`text-xs font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {formatCurrency(actual)}
            </span>
          </div>
          
          <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {isOverBudget ? 'Lebih' : 'Sisa'}
              </span>
              <div className="flex items-center gap-1">
                {isOverBudget ? (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                ) : remaining > 0 ? (
                  <TrendingDown className="w-3 h-3 text-green-500" />
                ) : null}
                <span className={`text-xs font-semibold ${
                  isOverBudget 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
