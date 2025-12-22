/**
 * WishlistForm Component
 * Compact form for adding/editing wishlist items - mobile optimized
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

export default function WishlistForm({ item, onSubmit, onCancel }: WishlistFormProps) {
  const [name, setName] = useState(item?.name || '')
  const [targetPrice, setTargetPrice] = useState(item?.targetPrice?.toString() || '')
  const [priority, setPriority] = useState<Priority>(item?.priority || 'medium')
  const [targetDate, setTargetDate] = useState(item?.targetDate || '')
  const [currentSaved, setCurrentSaved] = useState(item?.currentSaved?.toString() || '0')
  const [category, setCategory] = useState(item?.category || '')
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
      const result = await onSubmit({
        name: name.trim(),
        targetPrice: parsedTargetPrice,
        priority,
        targetDate: targetDate || undefined,
        currentSaved: parsedCurrentSaved,
        category: category.trim() || undefined,
      })
      if (!result.success && result.errors) setErrors(result.errors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {item ? 'Edit Wishlist' : 'Tambah Wishlist'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nama Item *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: MacBook Pro"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            {/* Target Price & Current Saved - Side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target (Rp) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetPrice ? formatCurrency(parseInt(targetPrice.replace(/[^\d]/g, ''), 10) || 0).replace('Rp ', '') : ''}
                  onChange={(e) => setTargetPrice(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="0"
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right font-mono focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Terkumpul (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={currentSaved ? formatCurrency(parseInt(currentSaved.replace(/[^\d]/g, ''), 10) || 0).replace('Rp ', '') : ''}
                  onChange={(e) => setCurrentSaved(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="0"
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right font-mono focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prioritas</label>
              <div className="grid grid-cols-3 gap-1.5">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                      priority === opt.value ? opt.color : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${priority === opt.value ? 'fill-current' : ''}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Target Date - Side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Elektronik"
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Tanggal</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                {errors.map((error, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">{error}</p>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Sticky Footer - Always visible */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 px-3 py-2.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-1.5 font-medium"
            >
              {item ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? 'Menyimpan...' : item ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
