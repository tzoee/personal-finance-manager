/**
 * Categories Page
 * Manage categories and subcategories
 */

import { useState, useEffect } from 'react'
import { Tags, Plus } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useTransactionStore } from '../store/transactionStore'
import CategoryList from '../components/categories/CategoryList'
import CategoryForm from '../components/categories/CategoryForm'
import SubcategoryForm from '../components/categories/SubcategoryForm'
import DeleteCategoryDialog from '../components/categories/DeleteCategoryDialog'
import type { Category, CategoryInput } from '../types'

type CategoryWithCount = Category & {
  transactionCount: number
  subcategories: (Category['subcategories'][0] & { transactionCount: number })[]
}

export default function Categories() {
  const {
    categoriesWithCounts,
    categories,
    initialized,
    initialize,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
  } = useCategories()

  const { initialize: initTransactions, initialized: txInitialized } = useTransactionStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null)
  const [deletingSubcategory, setDeletingSubcategory] = useState<{
    parentId: string
    subcategoryId: string
    count: number
  } | null>(null)

  useEffect(() => {
    if (!initialized) initialize()
    if (!txInitialized) initTransactions()
  }, [initialized, initialize, txInitialized, initTransactions])

  const handleAddCategory = async (input: CategoryInput) => {
    await addCategory(input)
    setShowAddForm(false)
  }

  const handleEditCategory = async (input: CategoryInput) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, input)
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (migrateToId?: string) => {
    if (deletingCategory) {
      await deleteCategory(deletingCategory.id, migrateToId)
      setDeletingCategory(null)
      // Reload to refresh transaction counts
      window.location.reload()
    }
  }

  const handleAddSubcategory = async (name: string) => {
    if (addingSubcategoryTo) {
      await addSubcategory(addingSubcategoryTo.id, name)
      setAddingSubcategoryTo(null)
    }
  }

  const handleDeleteSubcategory = async () => {
    if (deletingSubcategory) {
      await deleteSubcategory(
        deletingSubcategory.parentId,
        deletingSubcategory.subcategoryId
      )
      setDeletingSubcategory(null)
      window.location.reload()
    }
  }

  const existingNames = categories.map(c => c.name)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tags className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kategori</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white 
                   rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Kategori</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Kelola kategori dan subkategori untuk mengorganisir transaksi Anda. 
          Kategori default tidak bisa dihapus, tapi bisa ditambah subkategori.
        </p>
      </div>

      {/* Category List */}
      <div className="card p-4">
        <CategoryList
          categories={categoriesWithCounts}
          onEdit={setEditingCategory}
          onDelete={setDeletingCategory}
          onAddSubcategory={setAddingSubcategoryTo}
          onDeleteSubcategory={(parentId, subcategoryId, count) => 
            setDeletingSubcategory({ parentId, subcategoryId, count })
          }
        />
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setShowAddForm(false)}
          existingNames={existingNames}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleEditCategory}
          onCancel={() => setEditingCategory(null)}
          existingNames={existingNames}
        />
      )}

      {/* Add Subcategory Modal */}
      {addingSubcategoryTo && (
        <SubcategoryForm
          parentName={addingSubcategoryTo.name}
          existingNames={addingSubcategoryTo.subcategories.map(s => s.name)}
          onSubmit={handleAddSubcategory}
          onCancel={() => setAddingSubcategoryTo(null)}
        />
      )}

      {/* Delete Category Dialog */}
      {deletingCategory && (
        <DeleteCategoryDialog
          category={deletingCategory}
          availableCategories={categories}
          onConfirm={handleDeleteCategory}
          onCancel={() => setDeletingCategory(null)}
        />
      )}

      {/* Delete Subcategory Confirmation */}
      {deletingSubcategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Hapus Subkategori
            </h3>
            {deletingSubcategory.count > 0 ? (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Subkategori ini memiliki <span className="font-bold">{deletingSubcategory.count}</span> transaksi.
                Transaksi akan tetap ada tapi tidak memiliki subkategori.
              </p>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Apakah Anda yakin ingin menghapus subkategori ini?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingSubcategory(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSubcategory}
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
