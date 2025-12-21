/**
 * MonthlySummaryCard Component
 * Displays monthly income, expense, and surplus summary
 */

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import type { MonthlySummary } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface MonthlySummaryCardProps {
  summary: MonthlySummary
}

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  const isPositiveSurplus = summary.surplus >= 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          {monthNames[summary.month - 1]} {summary.year}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {summary.transactionCount} transaksi
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Income */}
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pemasukan</p>
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        {/* Expense */}
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pengeluaran</p>
          <p className="text-sm font-semibold text-red-600">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>

        {/* Surplus */}
        <div className="text-center">
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
            isPositiveSurplus 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            <Wallet className={`w-5 h-5 ${isPositiveSurplus ? 'text-blue-600' : 'text-amber-600'}`} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Surplus</p>
          <p className={`text-sm font-semibold ${isPositiveSurplus ? 'text-blue-600' : 'text-amber-600'}`}>
            {isPositiveSurplus ? '+' : ''}{formatCurrency(summary.surplus)}
          </p>
        </div>
      </div>

      {/* Surplus Rate */}
      {summary.totalIncome > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Surplus Rate</span>
            <span className={`font-medium ${
              summary.surplusRate >= 20 
                ? 'text-green-600' 
                : summary.surplusRate >= 0 
                ? 'text-blue-600' 
                : 'text-red-600'
            }`}>
              {summary.surplusRate.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                summary.surplusRate >= 20 
                  ? 'bg-green-500' 
                  : summary.surplusRate >= 0 
                  ? 'bg-blue-500' 
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(Math.max(summary.surplusRate, 0), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
