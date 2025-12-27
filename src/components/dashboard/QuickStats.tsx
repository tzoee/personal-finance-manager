import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Target, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import AnimatedNumber from '../ui/AnimatedNumber'

interface QuickStatsProps {
  netWorth: number
  income: number
  expense: number
  surplus: number
  activeInstallments: number
  totalInstallmentMonthly: number
  savingsCount: number
  totalSaved: number
  wishlistCount: number
  wishlistProgress: number
}

export default function QuickStats({
  netWorth,
  income,
  expense,
  surplus,
  activeInstallments,
  totalInstallmentMonthly,
  savingsCount,
  totalSaved,
  wishlistCount,
  wishlistProgress,
}: QuickStatsProps) {
  const currencyFormatter = (v: number) => formatCurrency(v)

  return (
    <div className="space-y-4">
      {/* Main Stats - Compact Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Net Worth */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Net Worth</span>
          </div>
          <p className={`text-lg font-bold ${netWorth < 0 ? 'text-orange-200' : ''}`}>
            {netWorth < 0 ? '-' : ''}
            <AnimatedNumber value={Math.abs(netWorth)} formatter={currencyFormatter} />
          </p>
        </div>

        {/* Income */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Pemasukan</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            <AnimatedNumber value={income} formatter={currencyFormatter} />
          </p>
        </div>

        {/* Expense */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Pengeluaran</span>
          </div>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            <AnimatedNumber value={expense} formatter={currencyFormatter} />
          </p>
        </div>

        {/* Surplus */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1 rounded ${surplus >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              <Wallet className={`w-3 h-3 ${surplus >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Surplus</span>
          </div>
          <p className={`text-lg font-bold ${surplus >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {surplus < 0 ? '-' : ''}
            <AnimatedNumber value={Math.abs(surplus)} formatter={currencyFormatter} />
          </p>
        </div>
      </div>

      {/* Secondary Stats - Cicilan, Tabungan, Wishlist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cicilan */}
        <Link 
          to="/installments"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all transform hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cicilan Aktif</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {activeInstallments} cicilan
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  <AnimatedNumber value={totalInstallmentMonthly} formatter={currencyFormatter} />/bln
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Tabungan */}
        <Link 
          to="/savings"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all transform hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Target Tabungan</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {savingsCount} target
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={totalSaved} formatter={currencyFormatter} /> terkumpul
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Wishlist */}
        <Link 
          to="/wishlist"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all transform hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wishlist</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {wishlistCount} item
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {wishlistProgress.toFixed(0)}% progress
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  )
}
