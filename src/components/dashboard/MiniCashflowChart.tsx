import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { CashflowData } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface MiniCashflowChartProps {
  data: CashflowData[]
}

export default function MiniCashflowChart({ data }: MiniCashflowChartProps) {
  const formatMonth = (month: string) => {
    const [, m] = month.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return months[parseInt(m) - 1]
  }

  const chartData = data.map(d => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }))

  const totalInstallment = data.reduce((sum, d) => sum + (d.installment || 0), 0)
  const hasInstallments = totalInstallment > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Cashflow 6 Bulan
        </h3>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-500 dark:text-gray-400">Masuk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-500 dark:text-gray-400">Keluar</span>
          </div>
          {hasInstallments && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-500 dark:text-gray-400">Cicilan</span>
            </div>
          )}
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barGap={1} barCategoryGap="15%">
            <XAxis 
              dataKey="monthLabel" 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
              axisLine={false}
              tickLine={false}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  income: 'Pemasukan',
                  expense: 'Pengeluaran',
                  installment: 'Cicilan',
                }
                return [formatCurrency(value), labels[name] || name]
              }}
              labelFormatter={(label) => label}
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e5e7eb)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="income" name="income" radius={[3, 3, 0, 0]} maxBarSize={16}>
              {chartData.map((_, index) => (
                <Cell key={`income-${index}`} fill="#22c55e" />
              ))}
            </Bar>
            <Bar dataKey="expense" name="expense" radius={[3, 3, 0, 0]} maxBarSize={16}>
              {chartData.map((_, index) => (
                <Cell key={`expense-${index}`} fill="#ef4444" />
              ))}
            </Bar>
            <Bar dataKey="installment" name="installment" radius={[3, 3, 0, 0]} maxBarSize={16}>
              {chartData.map((_, index) => (
                <Cell key={`installment-${index}`} fill="#a855f7" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary row */}
      <div className={`mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid gap-2 text-center ${hasInstallments ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Masuk</p>
          <p className="text-xs font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(data.reduce((sum, d) => sum + d.income, 0))}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Keluar</p>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(data.reduce((sum, d) => sum + d.expense, 0))}
          </p>
        </div>
        {hasInstallments && (
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Cicilan</p>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {formatCurrency(totalInstallment)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
