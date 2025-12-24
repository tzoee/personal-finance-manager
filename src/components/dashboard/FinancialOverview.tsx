import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import type { CategoryBreakdown } from '../../types'

interface FinancialOverviewProps {
  expenseBreakdown: CategoryBreakdown[]
  totalExpense: number
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']

export default function FinancialOverview({ expenseBreakdown, totalExpense }: FinancialOverviewProps) {
  const topCategories = expenseBreakdown.slice(0, 5)
  const otherAmount = expenseBreakdown.slice(5).reduce((sum, c) => sum + c.amount, 0)
  
  const chartData = [
    ...topCategories.map(c => ({ name: c.categoryName, value: c.amount })),
    ...(otherAmount > 0 ? [{ name: 'Lainnya', value: otherAmount }] : [])
  ]

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Distribusi Pengeluaran
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Belum ada data pengeluaran
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Distribusi Pengeluaran
      </h3>
      
      <div className="flex items-center gap-4">
        {/* Mini Pie Chart */}
        <div className="w-24 h-24 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {chartData.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-400 truncate max-w-[80px]">
                  {item.name}
                </span>
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
          {chartData.length > 4 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{chartData.length - 4} lainnya
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Total Pengeluaran</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalExpense)}
          </span>
        </div>
      </div>
    </div>
  )
}
