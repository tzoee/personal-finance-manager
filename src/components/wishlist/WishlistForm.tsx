/**
 * WishlistForm Component
 * Form for adding/editing wishlist items
 */

import { useState } from 'react'
import { X, Plus, Save, Star } from 'lucide-react'
import type { WishlistItem, WishlistInput, Priority } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface WishlistFormProps {
  item?: WishlistItem
  onSubmit: (input: WishlistInput) => Promise<{ success: boolean; errors?: string[] }>
  onCancel: () => void
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'Tinggi', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { value: 'medium', label: 'Sedang', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  { value: 'low', label: 'Rendah', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
]

export default function WishlistForm({
  item,
  onSubmit,
  onCancel,
}: WishlistFormProps) {
  const [name, setName] = useState(item?.name || '')
  const [targetPrice, setTargetPrice] = useState(item?.targetPrice?.toString() || '')
  const [priority, setPriority] = useState<Priority>(item?.priority || 'medium')
  const [targetDate, setTargetDate] = useState(item?.targetDate || '')
  const [currentSaved, setCurrentSaved] = useState(item?.currentSaved?.toString() || '0')
  const [category, setCategory] = useState(item?.category || '')
  const [note, setNote] = useState(item?.note || '')
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    const parsedTargetPrice = parseInt(targetPrice.replace(/[^\d]/g, ''), 10)
    const parsedCurrentSaved = parseInt(currentSaved.replace(/[^\d]/g, ''), 10) || 0

    if (!name.trim()) {
      setErrors(['Nama item wajib diisi'])
      return
    }

    if (isNaN(parsedTargetPrice) || parsedTargetPrice <= 0) {
      setErrors(['Target harga harus lebih dari 0'])
      return
    }

    setIsSubmitting(true)
    try {
      const input: WishlistInput = {
        name: name.trim(),
        targetPrice: parsedTargetPrice,
        priority,
        targetDate: targetDate || undefined,
        currentSaved: parsedCurrentSaved,
        category: category.trim() || undefined,
        note: note.trim() || undefined,
      }

      const result = await onSubmit(input)
      if (!result.success && result.errors) {
        setErrors(result.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item ? 'Edit Wishlist' : 'Tambah Wishlist'}
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
              Nama Item
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: MacBook Pro"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Target Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Harga (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={targetPrice ? formatCurrency(parseInt(targetPrice.replace(/[^\d]/g, ''), 10) || 0).replace('Rp ', '') : ''}
              onChange={(e) => setTargetPrice(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       text-right text-lg font-mono"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioritas
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    priority === opt.value ? opt.color : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Star className={`w-3 h-3 ${priority === opt.value ? 'fill-current' : ''}`} />
                  {opt.label}
                </button>
              ))}
            </div>
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
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Current Saved */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sudah Ditabung (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={currentSaved ? formatCurrency(parseInt(currentSaved.replace(/[^\d]/g, ''), 10) || 0).replace('Rp ', '') : ''}
              onChange={(e) => setCurrentSaved(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       text-right font-mono"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori (opsional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Elektronik, Fashion, Hobi"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catatan (opsional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                       hover:bg-primary-700 transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2"
            >
              {item ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? 'Menyimpan...' : item ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
