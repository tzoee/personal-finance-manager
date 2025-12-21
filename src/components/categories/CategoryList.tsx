/**
 * CategoryList Component
 * Displays categories with subcategories in an expandable list
 */

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard
} from 'lucide-react'
import type { Category, Subcategory } from '../../types'

interface CategoryWithCount extends Category {
  transactionCount: number
  subcategories: (Subcategory & { transactionCount: number })[]
}

interface CategoryListProps {
  categories: CategoryWithCount[]
  onEdit: (category: Category) => void
  onDelete: (category: CategoryWithCount) => void
  onAddSubcategory: (category: Category) => void
  onDeleteSubcategory: (parentId: string, subcategoryId: string, count: number) => void
}

const typeIcons = {
  income: TrendingUp,
  expense: TrendingDown,
  asset: Wallet,
  liability: CreditCard,
}

const typeColors = {
  income: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  expense: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  asset: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  liability: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
}

const typeLabels = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
  asset: 'Aset',
  liability: 'Liabilitas',
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
  onAddSubcategory,
  onDeleteSubcategory,
}: CategoryListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Belum ada kategori
      </div>
    )
  }

  // Group by type
  const grouped = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = []
    acc[cat.type].push(cat)
    return acc
  }, {} as Record<Category['type'], CategoryWithCount[]>)

  return (
    <div className="space-y-6">
      {(['income', 'expense', 'asset', 'liability'] as const).map(type => {
        const cats = grouped[type]
        if (!cats?.length) return null

        const Icon = typeIcons[type]

        return (
          <div key={type}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${typeColors[type]} mb-3`}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{typeLabels[type]}</span>
              <span className="text-sm opacity-75">({cats.length})</span>
            </div>

            <div className="space-y-2">
              {cats.map(category => {
                const isExpanded = expandedIds.has(category.id)
                const hasSubcategories = category.subcategories.length > 0

                return (
                  <div
                    key={category.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800">
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        disabled={!hasSubcategories}
                      >
                        {hasSubcategories ? (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </button>

                      <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                        {category.name}
                      </span>

                      {category.transactionCount > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 
                                       text-gray-600 dark:text-gray-400 rounded-full">
                          {category.transactionCount} transaksi
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onAddSubcategory(category)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Tambah subkategori"
                        >
                          <Plus className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => onEdit(category)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit kategori"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        {!category.isDefault && (
                          <button
                            onClick={() => onDelete(category)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Hapus kategori"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {isExpanded && hasSubcategories && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        {category.subcategories.map(sub => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 px-3 py-2 pl-10 
                                     border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          >
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                              {sub.name}
                            </span>

                            {sub.transactionCount > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 
                                             text-gray-600 dark:text-gray-400 rounded-full">
                                {sub.transactionCount}
                              </span>
                            )}

                            <button
                              onClick={() => onDeleteSubcategory(category.id, sub.id, sub.transactionCount)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Hapus subkategori"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
