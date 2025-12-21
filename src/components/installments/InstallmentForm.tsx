/**
 * InstallmentForm Component
 * Form for adding/editing installments
 */

import { useState } from 'react'
import { X, Plus, Save } from 'lucide-react'
import type { Installment, InstallmentInput } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface InstallmentFormProps {
  installment?: Installment
  onSubmit: (input: InstallmentInput) => Promise<{ success: boolean; errors?: string[] }>
  onCancel: () => void
}

const subcategoryOptions = [
  'Motor',
  'Mobil',
  'HP/Gadget',
  'Elektronik',
  'Furniture',
  'KPR',
  'Pendidikan',
  'Lainnya',
]

export default function InstallmentForm({
  installment,
  onSubmit,
  onCancel,
}: InstallmentFormProps) {
  const [name, setName] = useState(installment?.name || '')
  const [totalTenor, setTotalTenor] = useState(installment?.totalTenor?.toString() || '')
  const [monthlyAmount, setMonthlyAmount] = useState(installment?.monthlyAmount?.toString() || '')
  const [startDate, setStartDate] = useState(installment?.startDate || new Date().toISOString().split('T')[0])
  const [subcategory, setSubcategory] = useState(installment?.subcategory || '')
  const [autoGenerate, setAutoGenerate] = useState(installment?.autoGenerateTransaction || false)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    const parsedTenor = parseInt(totalTenor, 10)
    const parsedAmount = parseInt(monthlyAmount.replace(/[^\d]/g, ''), 10)

    if (!name.trim()) {
      setErrors(['Nama cicilan wajib diisi'])
      return
    }

    if (isNaN(parsedTenor) || parsedTenor <= 0) {
      setErrors(['Total tenor harus lebih dari 0'])
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrors(['Jumlah per bulan harus lebih dari 0'])
      return
    }

    if (!subcategory) {
      setErrors(['Subkategori wajib dipilih'])
      return
    }

    setIsSubmitting(true)
    try {
      const input: InstallmentInput = {
        name: name.trim(),
        totalTenor: parsedTenor,
        monthlyAmount: parsedAmount,
        startDate,
        subcategory,
        autoGenerateTransaction: autoGenerate,
      }

      const result = await onSubmit(input)
      if (!result.success && result.errors) {
        setErrors(result.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount = (parseInt(totalTenor, 10) || 0) * (parseInt(monthlyAmount.replace(/[^\d]/g, ''), 10) || 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {installment ? 'Edit Cicilan' : 'Tambah Cicilan'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Cicilan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Cicilan Motor Honda"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subkategori
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">-- Pilih Subkategori --</option>
              {subcategoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Monthly Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jumlah per Bulan (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyAmount ? formatCurrency(parseInt(monthlyAmount.replace(/[^\d]/g, ''), 10) || 0).replace('Rp ', '') : ''}
              onChange={(e) => setMonthlyAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       text-right text-lg font-mono"
            />
          </div>

          {/* Total Tenor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Tenor (bulan)
            </label>
            <input
              type="number"
              value={totalTenor}
              onChange={(e) => setTotalTenor(e.target.value)}
              placeholder="12"
              min="1"
              max="360"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Total Amount Preview */}
          {totalAmount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cicilan:</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          )}

          {/* Auto Generate Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Auto-generate transaksi setiap bulan
            </span>
          </label>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              {errors.map((error, i) => (
                <p key={i} className="text-sm text-red-600 dark:text-red-400">{error}</p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                       dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg 
                       hover:bg-primary-700 transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2"
            >
              {installment ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? 'Menyimpan...' : installment ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
