/**
 * SavingsForm Component
 * Form for creating/editing savings goals
 */

import { useState, useEffect } from 'react'
import { X, PiggyBank } from 'lucide-react'
import type { SavingsGoal, SavingsGoalInput, WishlistItem } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface SavingsFormProps {
  savings?: SavingsGoal
  wishlistItems?: WishlistItem[]
  onSubmit: (input: SavingsGoalInput) => Promise<{ success: boolean; errors?: string[] }>
  onCancel: () => void
}

export default function SavingsForm({
  savings,
  wishlistItems = [],
  onSubmit,
  onCancel,
}: SavingsFormProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [linkedWishlistId, setLinkedWishlistId] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (savings) {
      setName(savings.name)
      setTargetAmount(savings.targetAmount.toString())
      setTargetDate(savings.targetDate || '')
      setLinkedWishlistId(savings.linkedWishlistId || '')
      setNote(savings.note || '')
    }
  }, [savings])

  // Auto-fill from wishlist
  const handleWishlistSelect = (wishlistId: string) => {
    setLinkedWishlistId(wishlistId)
    if (wishlistId) {
      const item = wishlistItems.find(w => w.id === wishlistId)
      if (item) {
        if (!name) setName(`Tabungan untuk ${item.name}`)
        if (!targetAmount) setTargetAmount(item.targetPrice.toString())
        if (!targetDate && item.targetDate) setTargetDate(item.targetDate)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    const parsedAmount = parseInt(targetAmount.replace(/[^\d]/g, ''), 10)

    if (!name.trim()) {
      setErrors(['Nama tabungan wajib diisi'])
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrors(['Target harus lebih dari 0'])
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onSubmit({
        name: name.trim(),
        targetAmount: parsedAmount,
        targetDate: targetDate || undefined,
        linkedWishlistId: linkedWishlistId || undefined,
        note: note.trim() || undefined,
      })

      if (!result.success && result.errors) {
        setErrors(result.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const parsedAmount = parseInt(targetAmount.replace(/[^\d]/g, ''), 10) || 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {savings ? 'Edit Tabungan' : 'Tambah Tabungan'}
            </h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Link to Wishlist */}
          {wishlistItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link ke Wishlist (opsional)
              </label>
              <select
                value={linkedWishlistId}
                onChange={(e) => handleWishlistSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Pilih Wishlist --</option>
                {wishlistItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({formatCurrency(item.targetPrice)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Tabungan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dana Darurat"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={targetAmount ? formatCurrency(parsedAmount).replace('Rp ', '') : ''}
              onChange={(e) => setTargetAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right font-mono"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Tanggal (opsional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catatan (opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

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
                       hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : savings ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
