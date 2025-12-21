/**
 * Installments Page
 * Manage monthly installments
 */

import { useState, useEffect } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { useInstallments } from '../hooks/useInstallments'
import InstallmentForm from '../components/installments/InstallmentForm'
import InstallmentList from '../components/installments/InstallmentList'
import type { Installment, InstallmentInput } from '../types'
import { formatCurrency } from '../utils/formatters'

export default function Installments() {
  const {
    activeInstallments,
    paidOffInstallments,
    totalMonthlyAmount,
    totalRemainingAmount,
    initialized,
    initialize,
    addInstallment,
    updateInstallment,
    deleteInstallment,
  } = useInstallments()

  const [showForm, setShowForm] = useState(false)
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null)
  const [deletingInstallment, setDeletingInstallment] = useState<Installment | null>(null)
  const [showPaidOff, setShowPaidOff] = useState(false)

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  const handleAddInstallment = async (input: InstallmentInput) => {
    const result = await addInstallment(input)
    if (result.success) {
      setShowForm(false)
    }
    return result
  }

  const handleEditInstallment = async (input: InstallmentInput) => {
    if (!editingInstallment) return { success: false, errors: ['No installment selected'] }
    
    await updateInstallment(editingInstallment.id, input)
    setEditingInstallment(null)
    return { success: true }
  }

  const handleDeleteInstallment = async () => {
    if (!deletingInstallment) return
    await deleteInstallment(deletingInstallment.id)
    setDeletingInstallment(null)
  }

  const displayedInstallments = showPaidOff ? paidOffInstallments : activeInstallments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cicilan</h1>
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
      {activeInstallments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total per Bulan</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(totalMonthlyAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Sisa</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalRemainingAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowPaidOff(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showPaidOff
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Aktif ({activeInstallments.length})
        </button>
        <button
          onClick={() => setShowPaidOff(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPaidOff
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Lunas ({paidOffInstallments.length})
        </button>
      </div>

      {/* Installment List */}
      <InstallmentList
        installments={displayedInstallments}
        onEdit={setEditingInstallment}
        onDelete={setDeletingInstallment}
      />

      {/* Add Form Modal */}
      {showForm && (
        <InstallmentForm
          onSubmit={handleAddInstallment}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Form Modal */}
      {editingInstallment && (
        <InstallmentForm
          installment={editingInstallment}
          onSubmit={handleEditInstallment}
          onCancel={() => setEditingInstallment(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingInstallment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Hapus Cicilan
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Apakah Anda yakin ingin menghapus cicilan "{deletingInstallment.name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingInstallment(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteInstallment}
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
