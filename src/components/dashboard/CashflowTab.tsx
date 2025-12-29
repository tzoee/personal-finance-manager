import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import type { CashflowData } from '../../types'

interface CashflowTabProps {
  data: CashflowData[]
  currentIncome: number
  currentExpense: number
  previousIncome: number
  previousExpense: number
}

export default function CashflowTab({
  data,
  currentIncome,
  currentExpense,
  previousIncome,
  previousExpense,
}: CashflowTabProps) {
  // Calculate changes
  const incomeChange = previousIncome > 0 
    ? ((currentIncome - previousIncome) / previousIncome) * 100 
    : 0
  const expenseChange = previousExpense > 0 
    ? ((currentExpense - previousExpense) / previousExpense) * 100 
    : 0

  // Get last 6 months for mini chart
  const chartData = data.slice(-6)
  const maxValue = Math.max(...chartData.flatMap(d => [d.income, d.expense, d.installment]))

  return (
    <div className="space-y-4">
      {/* Month Comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400">Pemasukan</span>
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(currentIncome)}
          </p>
          <p className={`text-xs ${incomeChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs bulan lalu
          </p>
        </div>

        <div className="p-3 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-100 dark:border-rose-800/30">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-rose-700 dark:text-rose-400">Pengeluaran</span>
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(currentExpense)}
          </p>
          <p className={`text-xs ${expenseChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% vs bulan lalu
          </p>
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">6 Bulan Terakhir</p>
        <div className="flex items-end gap-1 h-24">
          {chartData.map((item) => {
            const incomeHeight = maxValue > 0 ? (item.income / maxValue) * 100 : 0
            const expenseHeight = maxValue > 0 ? (item.expense / maxValue) * 100 : 0
            const installmentHeight = maxValue > 0 ? (item.installment / maxValue) * 100 : 0
            
            return (
              <div key={item.month} className="flex-1 flex gap-0.5 items-end">
                <div
                  className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t"
                  style={{ height: `${incomeHeight}%` }}
                  title={`Income: ${formatCurrency(item.income)}`}
                />
                <div
                  className="flex-1 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t"
                  style={{ height: `${expenseHeight}%` }}
                  title={`Expense: ${formatCurrency(item.expense)}`}
                />
                <div
                  className="flex-1 bg-gradient-to-t from-violet-500 to-purple-400 rounded-t"
                  style={{ height: `${installmentHeight}%` }}
                  title={`Installment: ${formatCurrency(item.installment)}`}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-1">
          {chartData.map((item) => (
            <span key={item.month} className="text-[10px] text-gray-400 flex-1 text-center">
              {item.month.split('-')[1]}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Pemasukan</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-400 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Pengeluaran</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-400 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Cicilan</span>
        </div>
      </div>
    </div>
  )
}
