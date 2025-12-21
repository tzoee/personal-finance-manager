/**
 * CategoryForm Component
 * Form for adding/editing categories
 */

import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import type { Category, CategoryInput } from '../../types'

interface CategoryFormProps {
  category?: Category
  onSubmit: (input: CategoryInput) => Promise<void>
  onCancel: () => void
  existingNames: string[]
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  existingNames,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<Category['type']>(category?.type || 'expense')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setType(category.type)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Nama kategori tidak boleh kosong')
      return
    }

    // Check for duplicate names (excluding current category if editing)
    const isDuplicate = existingNames.some(
      n => n.toLowerCase() === trimmedName.toLowerCase() && 
           (!category || n.toLowerCase() !== category.name.toLowerCase())
    )
    if (isDuplicate) {
      setError('Nama kategori sudah ada')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ name: trimmedName, type })
      setName('')
      setType('expense')
    } catch {
      setError('Gagal menyimpan kategori')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Makanan"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipe
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Category['type'])}
              disabled={!!category} // Can't change type when editing
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
              <option value="asset">Aset</option>
              <option value="liability">Liabilitas</option>
            </select>
            {category && (
              <p className="text-xs text-gray-500 mt-1">
                Tipe tidak bisa diubah setelah kategori dibuat
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

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
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : category ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
