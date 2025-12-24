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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Cashflow 6 Bulan
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-500 dark:text-gray-400">Masuk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-500 dark:text-gray-400">Keluar</span>
          </div>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barGap={2}>
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
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => label}
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e5e7eb)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="income" name="Pemasukan" radius={[3, 3, 0, 0]} maxBarSize={20}>
              {chartData.map((_, index) => (
                <Cell key={`income-${index}`} fill="#22c55e" />
              ))}
            </Bar>
            <Bar dataKey="expense" name="Pengeluaran" radius={[3, 3, 0, 0]} maxBarSize={20}>
              {chartData.map((_, index) => (
                <Cell key={`expense-${index}`} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
