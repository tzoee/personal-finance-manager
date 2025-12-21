/**
 * Savings Page
 * Manage savings goals with deposit tracking
 */

import { useState, useEffect } from 'react'
import { PiggyBank, Plus } from 'lucide-react'
import { useSavings, SavingsWithDetails } from '../hooks/useSavings'
import { useWishlist } from '../hooks/useWishlist'
import SavingsList from '../components/savings/SavingsList'
import SavingsForm from '../components/savings/SavingsForm'
import DepositForm from '../components/savings/DepositForm'
import type { SavingsGoal, SavingsGoalInput, SavingsDepositInput } from '../types'
import { formatCurrency } from '../utils/formatters'

export default function Savings() {
  const {
    savingsWithDetails,
    totals,
    initialized,
    initialize,
    addSavings,
    updateSavings,
    deleteSavings,
    addDeposit,
  } = useSavings()

  const { wishlist, initialized: wishlistInitialized, initialize: initWishlist } = useWishlist()

  const [showForm, setShowForm] = useState(false)
  const [editingSavings, setEditingSavings] = useState<SavingsGoal | null>(null)
  const [deletingSavings, setDeletingSavings] = useState<SavingsWithDetails | null>(null)
  const [depositingSavings, setDepositingSavings] = useState<SavingsWithDetails | null>(null)

  useEffect(() => {
    if (!initialized) initialize()
    if (!wishlistInitialized) initWishlist()
  }, [initialized, initialize, wishlistInitialized, initWishlist])

  const handleAddSavings = async (input: SavingsGoalInput) => {
    const result = await addSavings(input)
    if (result.success) {
      setShowForm(false)
    }
    return result
  }

  const handleEditSavings = async (input: SavingsGoalInput) => {
    if (!editingSavings) return { success: false, errors: ['No savings selected'] }
    
    await updateSavings(editingSavings.id, input)
    setEditingSavings(null)
    return { success: true }
  }

  const handleDeleteSavings = async () => {
    if (!deletingSavings) return
    await deleteSavings(deletingSavings.id)
    setDeletingSavings(null)
  }

  const handleDeposit = async (input: SavingsDepositInput) => {
    if (!depositingSavings) return { success: false, error: 'No savings selected' }
    
    const result = await addDeposit(depositingSavings.id, input)
    if (result.success) {
      setDepositingSavings(null)
    }
    return result
  }

  // Filter wishlist items that are not yet linked to savings
  const availableWishlist = wishlist.filter(
    w => !savingsWithDetails.some(s => s.linkedWishlistId === w.id)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tabungan</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white 
                   rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Summary Card */}
      {savingsWithDetails.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Target</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totals.totalTarget)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Terkumpul</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(totals.totalSaved)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kurang</p>
              <p className="font-semibold text-amber-600">
                {formatCurrency(totals.totalRemaining)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</p>
              <p className="font-semibold text-primary-600">
                {totals.overallProgress.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Savings List */}
      <SavingsList
        savings={savingsWithDetails}
        onDeposit={setDepositingSavings}
        onEdit={setEditingSavings}
        onDelete={setDeletingSavings}
      />

      {/* Add Form Modal */}
      {showForm && (
        <SavingsForm
          wishlistItems={availableWishlist}
          onSubmit={handleAddSavings}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Form Modal */}
      {editingSavings && (
        <SavingsForm
          savings={editingSavings}
          wishlistItems={availableWishlist}
          onSubmit={handleEditSavings}
          onCancel={() => setEditingSavings(null)}
        />
      )}

      {/* Deposit Form Modal */}
      {depositingSavings && (
        <DepositForm
          savingsName={depositingSavings.name}
          remaining={depositingSavings.remaining}
          onSubmit={handleDeposit}
          onCancel={() => setDepositingSavings(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingSavings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Hapus Tabungan
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Apakah Anda yakin ingin menghapus tabungan "{deletingSavings.name}"?
              {deletingSavings.deposits.length > 0 && (
                <span className="block mt-2 text-sm text-amber-600">
                  Semua riwayat deposit ({deletingSavings.deposits.length} transaksi) akan ikut terhapus.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingSavings(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSavings}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg 
                         hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
