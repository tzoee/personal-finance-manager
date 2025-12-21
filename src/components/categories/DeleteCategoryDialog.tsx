/**
 * DeleteCategoryDialog Component
 * Dialog for deleting categories with migration option
 */

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import type { Category } from '../../types'

interface DeleteCategoryDialogProps {
  category: Category & { transactionCount: number }
  availableCategories: Category[]
  onConfirm: (migrateToId?: string) => Promise<void>
  onCancel: () => void
}

export default function DeleteCategoryDialog({
  category,
  availableCategories,
  onConfirm,
  onCancel,
}: DeleteCategoryDialogProps) {
  const [migrateToId, setMigrateToId] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const hasTransactions = category.transactionCount > 0
  const sameTypeCategories = availableCategories.filter(
    c => c.type === category.type && c.id !== category.id
  )

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm(hasTransactions ? migrateToId || undefined : undefined)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Hapus Kategori
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Apakah Anda yakin ingin menghapus kategori{' '}
            <span className="font-semibold">{category.name}</span>?
          </p>

          {hasTransactions && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Kategori ini memiliki <span className="font-bold">{category.transactionCount}</span> transaksi.
                Pilih kategori tujuan untuk memindahkan transaksi tersebut.
              </p>
            </div>
          )}

          {hasTransactions && sameTypeCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pindahkan transaksi ke:
              </label>
              <select
                value={migrateToId}
                onChange={(e) => setMigrateToId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">-- Pilih kategori --</option>
                {sameTypeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasTransactions && sameTypeCategories.length === 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                Tidak ada kategori lain dengan tipe yang sama. Buat kategori baru terlebih dahulu untuk memindahkan transaksi.
              </p>
            </div>
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
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting || (hasTransactions && !migrateToId && sameTypeCategories.length > 0)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg 
                       hover:bg-red-700 transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
