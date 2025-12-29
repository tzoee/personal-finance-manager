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
        <div className="p-3 bg-gradient-to-br from-[#FFE3B3]/30 to-[#FFB173]/20 dark:from-[#FFE3B3]/10 dark:to-[#FFB173]/10 rounded-xl border border-[#FFB173]/30">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-[#FFB173]" />
            <span className="text-xs text-[#CA2851] dark:text-[#FF6766]">Pemasukan</span>
          </div>
          <p className="text-lg font-bold text-[#CA2851] dark:text-[#FF6766]">
            {formatCurrency(currentIncome)}
          </p>
          <p className={`text-xs ${incomeChange >= 0 ? 'text-green-600' : 'text-[#CA2851]'}`}>
            {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs bulan lalu
          </p>
        </div>

        <div className="p-3 bg-gradient-to-br from-[#CA2851]/10 to-[#FF6766]/10 dark:from-[#CA2851]/20 dark:to-[#FF6766]/20 rounded-xl border border-[#FF6766]/30">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-[#FF6766]" />
            <span className="text-xs text-[#CA2851] dark:text-[#FF6766]">Pengeluaran</span>
          </div>
          <p className="text-lg font-bold text-[#CA2851] dark:text-[#FF6766]">
            {formatCurrency(currentExpense)}
          </p>
          <p className={`text-xs ${expenseChange <= 0 ? 'text-green-600' : 'text-[#CA2851]'}`}>
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
                  className="flex-1 bg-gradient-to-t from-[#FFB173] to-[#FFE3B3] rounded-t"
                  style={{ height: `${incomeHeight}%` }}
                  title={`Income: ${formatCurrency(item.income)}`}
                />
                <div
                  className="flex-1 bg-gradient-to-t from-[#CA2851] to-[#FF6766] rounded-t"
                  style={{ height: `${expenseHeight}%` }}
                  title={`Expense: ${formatCurrency(item.expense)}`}
                />
                <div
                  className="flex-1 bg-gradient-to-t from-[#FF6766] to-[#FFB173] rounded-t"
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
          <div className="w-3 h-3 bg-gradient-to-r from-[#FFB173] to-[#FFE3B3] rounded" />
          <span className="text-gray-600 dark:text-gray-400">Pemasukan</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-[#CA2851] to-[#FF6766] rounded" />
          <span className="text-gray-600 dark:text-gray-400">Pengeluaran</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-[#FF6766] to-[#FFB173] rounded" />
          <span className="text-gray-600 dark:text-gray-400">Cicilan</span>
        </div>
      </div>
    </div>
  )
}
