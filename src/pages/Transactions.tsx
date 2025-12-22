/**
 * Transactions Page
 * Record and manage financial transactions
 */

import { useState, useEffect, useMemo } from 'react'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategoryStore } from '../store/categoryStore'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'
import FilterBar from '../components/transactions/FilterBar'
import MonthlySummaryCard from '../components/transactions/MonthlySummaryCard'
import type { Transaction, TransactionInput, TransactionFilters } from '../types'

export default function Transactions() {
  const {
    transactionsWithCategory,
    currentMonthSummary,
    initialized,
    initialize,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactions,
    categories,
  } = useTransactions()

  const { initialize: initCategories, initialized: catInitialized } = useCategoryStore()

  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    if (!initialized) initialize()
    if (!catInitialized) initCategories()
  }, [initialized, initialize, catInitialized, initCategories])

  // Apply filters and search
  const displayedTransactions = useMemo(() => {
    let result = transactionsWithCategory

    // Apply filters
    if (filters.type || filters.categoryId || filters.startDate || filters.endDate) {
      result = filterTransactions(filters)
    }

    // Apply search
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      result = result.filter(tx => 
        tx.categoryName?.toLowerCase().includes(searchLower) ||
        tx.subcategoryName?.toLowerCase().includes(searchLower) ||
        tx.note?.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [transactionsWithCategory, filters, searchText, filterTransactions])

  const handleAddTransaction = async (input: TransactionInput) => {
    const result = await addTransaction(input)
    if (result.success) {
      setShowForm(false)
    }
    return result
  }

  const handleEditTransaction = async (input: TransactionInput) => {
    if (!editingTransaction) return { success: false, errors: ['No transaction selected'] }
    
    const result = await updateTransaction(editingTransaction.id, input)
    if (result.success) {
      setEditingTransaction(null)
    }
    return result
  }

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return
    await deleteTransaction(deletingTransaction.id)
    setDeletingTransaction(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <ArrowLeftRight className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Transaksi</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white 
                   rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Tambah</span>
        </button>
      </div>

      {/* Monthly Summary */}
      <MonthlySummaryCard summary={currentMonthSummary} />

      {/* Filter Bar */}
      <FilterBar
        categories={categories}
        filters={filters}
        onFilterChange={setFilters}
        onSearch={setSearchText}
      />

      {/* Transaction List */}
      <TransactionList
        transactions={displayedTransactions}
        onEdit={setEditingTransaction}
        onDelete={setDeletingTransaction}
      />

      {/* Add Transaction Modal */}
      {showForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onSubmit={handleEditTransaction}
          onCancel={() => setEditingTransaction(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Hapus Transaksi
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTransaction(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteTransaction}
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
