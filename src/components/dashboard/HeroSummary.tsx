import { useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Building2, PiggyBank, CreditCard, Receipt } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface NetWorthBreakdown {
  assetNetWorth: number
  transactionBalance: number
  totalSavings: number
  remainingInstallments: number
}

interface HeroSummaryProps {
  netWorth: number
  income: number
  expense: number
  surplus: number
  budgetTotal: number
  netWorthBreakdown?: NetWorthBreakdown
}

export default function HeroSummary({
  netWorth,
  income,
  expense,
  surplus,
  budgetTotal,
  netWorthBreakdown,
}: HeroSummaryProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const isPositiveSurplus = surplus >= 0
  const budgetPercentage = budgetTotal > 0 ? Math.min((expense / budgetTotal) * 100, 100) : 0
  const isOverBudget = budgetPercentage > 100

  return (
    <div className="card p-5 bg-gradient-to-br from-[#CA2851] via-[#FF6766] to-[#FFB173] text-white">
      <div className="text-center mb-4">
        <p className="text-white/80 text-sm mb-1">Total Kekayaan Bersih</p>
        <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
        
        {/* Toggle breakdown button */}
        {netWorthBreakdown && (
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-2 flex items-center justify-center gap-1 mx-auto text-xs text-white/80 hover:text-white transition-colors"
          >
            <span>Lihat Detail</span>
            {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Net Worth Breakdown */}
      {showBreakdown && netWorthBreakdown && (
        <div className="mb-5 p-3 bg-white/10 backdrop-blur-sm rounded-xl space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#FFE3B3]" />
              <span className="text-white/90">Aset Bersih</span>
            </div>
            <span className="font-medium">{formatCurrency(netWorthBreakdown.assetNetWorth)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#FFE3B3]" />
              <span className="text-white/90">Saldo Transaksi</span>
            </div>
            <span className={`font-medium ${netWorthBreakdown.transactionBalance >= 0 ? 'text-[#FFE3B3]' : 'text-white'}`}>
              {formatCurrency(netWorthBreakdown.transactionBalance)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-[#FFE3B3]" />
              <span className="text-white/90">Total Tabungan</span>
            </div>
            <span className="font-medium text-[#FFE3B3]">{formatCurrency(netWorthBreakdown.totalSavings)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-white" />
              <span className="text-white/90">Sisa Cicilan</span>
            </div>
            <span className="font-medium text-white">-{formatCurrency(netWorthBreakdown.remainingInstallments)}</span>
          </div>
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(netWorth)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-white/15 backdrop-blur-sm rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUpRight className="w-4 h-4 text-[#FFE3B3]" />
            <span className="text-xs text-white/80">Pemasukan</span>
          </div>
          <p className="font-semibold text-[#FFE3B3]">{formatCurrency(income)}</p>
        </div>

        <div className="text-center p-3 bg-white/15 backdrop-blur-sm rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDownRight className="w-4 h-4 text-white" />
            <span className="text-xs text-white/80">Pengeluaran</span>
          </div>
          <p className="font-semibold text-white">{formatCurrency(expense)}</p>
        </div>

        <div className="text-center p-3 bg-white/15 backdrop-blur-sm rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            {isPositiveSurplus ? (
              <TrendingUp className="w-4 h-4 text-[#FFE3B3]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-white" />
            )}
            <span className="text-xs text-white/80">Surplus</span>
          </div>
          <p className={`font-semibold ${isPositiveSurplus ? 'text-[#FFE3B3]' : 'text-white'}`}>
            {formatCurrency(surplus)}
          </p>
        </div>
      </div>

      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
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
              isOverBudget ? 'bg-white' : budgetPercentage > 80 ? 'bg-[#FFE3B3]' : 'bg-[#FFE3B3]'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-white/80 mt-1">
          {formatCurrency(expense)} / {formatCurrency(budgetTotal)}
        </p>
      </div>
    </div>
  )
}
