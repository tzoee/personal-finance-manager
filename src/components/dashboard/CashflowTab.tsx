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
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 dark:text-green-400">Pemasukan</span>
          </div>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            {formatCurrency(currentIncome)}
          </p>
          <p className={`text-xs ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs bulan lalu
          </p>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700 dark:text-red-400">Pengeluaran</span>
          </div>
          <p className="text-lg font-bold text-red-700 dark:text-red-400">
            {formatCurrency(currentExpense)}
          </p>
          <p className={`text-xs ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                  className="flex-1 bg-green-400 dark:bg-green-500 rounded-t"
                  style={{ height: `${incomeHeight}%` }}
                  title={`Income: ${formatCurrency(item.income)}`}
                />
                <div
                  className="flex-1 bg-red-400 dark:bg-red-500 rounded-t"
                  style={{ height: `${expenseHeight}%` }}
                  title={`Expense: ${formatCurrency(item.expense)}`}
                />
                <div
                  className="flex-1 bg-purple-400 dark:bg-purple-500 rounded-t"
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
          <div className="w-3 h-3 bg-green-400 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Pemasukan</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-400 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Pengeluaran</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-400 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Cicilan</span>
        </div>
      </div>
    </div>
  )
}
