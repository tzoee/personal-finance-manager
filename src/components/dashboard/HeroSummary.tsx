import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface HeroSummaryProps {
  netWorth: number
  income: number
  expense: number
  surplus: number
  budgetTotal: number
}

export default function HeroSummary({
  netWorth,
  income,
  expense,
  surplus,
  budgetTotal,
}: HeroSummaryProps) {
  const isPositiveSurplus = surplus >= 0
  const budgetPercentage = budgetTotal > 0 ? Math.min((expense / budgetTotal) * 100, 100) : 0
  const isOverBudget = budgetPercentage > 100

  return (
    <div className="card p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
      <div className="text-center mb-6">
        <p className="text-primary-100 text-sm mb-1">Total Kekayaan Bersih</p>
        <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUpRight className="w-4 h-4 text-green-300" />
            <span className="text-xs text-primary-100">Pemasukan</span>
          </div>
          <p className="font-semibold text-green-300">{formatCurrency(income)}</p>
        </div>

        <div className="text-center p-3 bg-white/10 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-300" />
            <span className="text-xs text-primary-100">Pengeluaran</span>
          </div>
          <p className="font-semibold text-red-300">{formatCurrency(expense)}</p>
        </div>

        <div className="text-center p-3 bg-white/10 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            {isPositiveSurplus ? (
              <TrendingUp className="w-4 h-4 text-green-300" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-300" />
            )}
            <span className="text-xs text-primary-100">Surplus</span>
          </div>
          <p className={`font-semibold ${isPositiveSurplus ? 'text-green-300' : 'text-red-300'}`}>
            {formatCurrency(surplus)}
          </p>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Budget Bulan Ini</span>
          </div>
          <span className="text-sm font-medium">
            {budgetPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-red-400' : budgetPercentage > 80 ? 'bg-yellow-400' : 'bg-green-400'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-primary-100 mt-1">
          {formatCurrency(expense)} / {formatCurrency(budgetTotal)}
        </p>
      </div>
    </div>
  )
}
