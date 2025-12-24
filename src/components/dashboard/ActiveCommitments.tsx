import { CreditCard, Target, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import type { Installment, WishlistItem, SavingsGoal } from '../../types'

interface ActiveCommitmentsProps {
  installments: Installment[]
  wishlist: WishlistItem[]
  savings: SavingsGoal[]
}

export default function ActiveCommitments({ installments, wishlist, savings }: ActiveCommitmentsProps) {
  const activeInstallments = installments.filter(i => i.status === 'active').slice(0, 3)
  const activeWishlist = wishlist.filter(w => w.status !== 'bought').slice(0, 3)
  const activeSavings = savings.slice(0, 3)

  const calculateSavingsProgress = (s: SavingsGoal) => {
    const total = s.deposits.reduce((sum, d) => sum + d.amount, 0)
    return s.targetAmount > 0 ? (total / s.targetAmount) * 100 : 0
  }

  const calculateWishlistProgress = (w: WishlistItem) => {
    return w.targetPrice > 0 ? (w.currentSaved / w.targetPrice) * 100 : 0
  }

  const calculateInstallmentProgress = (i: Installment) => {
    return i.totalTenor > 0 ? (i.currentMonth / i.totalTenor) * 100 : 0
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Komitmen Keuangan
        </h3>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {/* Cicilan Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Cicilan Aktif</span>
            </div>
            <Link to="/installments" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          {activeInstallments.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">Tidak ada cicilan aktif</p>
          ) : (
            <div className="space-y-2">
              {activeInstallments.map(inst => (
                <div key={inst.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {inst.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${calculateInstallmentProgress(inst)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {inst.currentMonth}/{inst.totalTenor}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400 whitespace-nowrap">
                    {formatCurrency(inst.monthlyAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabungan Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Target Tabungan</span>
            </div>
            <Link to="/savings" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          {activeSavings.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada target tabungan</p>
          ) : (
            <div className="space-y-2">
              {activeSavings.map(s => {
                const progress = calculateSavingsProgress(s)
                const totalSaved = s.deposits.reduce((sum, d) => sum + d.amount, 0)
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {s.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(totalSaved)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Wishlist Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Wishlist</span>
            </div>
            <Link to="/wishlist" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          {activeWishlist.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">Wishlist kosong</p>
          ) : (
            <div className="space-y-2">
              {activeWishlist.map(w => {
                const progress = calculateWishlistProgress(w)
                return (
                  <div key={w.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {w.name}
                        </p>
                        {w.priority === 'high' && (
                          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {formatCurrency(w.targetPrice)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
