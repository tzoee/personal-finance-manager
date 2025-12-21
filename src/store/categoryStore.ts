import { create } from 'zustand'
import type { Category, Subcategory, CategoryInput } from '../types'
import { generateId } from '../utils/idGenerator'
import { getDefaultCategories } from '../constants/defaults'

interface CategoryState {
  categories: Category[]
  initialized: boolean
  initialize: () => Promise<void>
  addCategory: (input: CategoryInput) => Promise<Category>
  updateCategory: (id: string, input: Partial<CategoryInput>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addSubcategory: (parentId: string, name: string) => Promise<Subcategory>
  deleteSubcategory: (parentId: string, subcategoryId: string) => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  getCategoriesByType: (type: Category['type']) => Category[]
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_categories')
      if (stored) {
        const parsed = JSON.parse(stored) as Category[]
        set({ categories: parsed, initialized: true })
      } else {
        // Initialize with default categories
        const defaults = getDefaultCategories()
        localStorage.setItem('pfm_categories', JSON.stringify(defaults))
        set({ categories: defaults, initialized: true })
      }
    } catch {
      const defaults = getDefaultCategories()
      set({ categories: defaults, initialized: true })
    }
  },

  addCategory: async (input: CategoryInput) => {
    const { categories } = get()
    const now = new Date().toISOString()

    const newCategory: Category = {
      id: generateId(),
      name: input.name.trim(),
      type: input.type,
      subcategories: [],
      isDefault: false,
      createdAt: now,
    }

    const updated = [...categories, newCategory]
    localStorage.setItem('pfm_categories', JSON.stringify(updated))
    set({ categories: updated })

    return newCategory
  },

  updateCategory: async (id: string, input: Partial<CategoryInput>) => {
    const { categories } = get()
    const updated = categories.map(cat => {
      if (cat.id === id) {
        return {
          ...cat,
          name: input.name?.trim() ?? cat.name,
          type: input.type ?? cat.type,
        }
      }
      return cat
    })

    localStorage.setItem('pfm_categories', JSON.stringify(updated))
    set({ categories: updated })
  },

  deleteCategory: async (id: string) => {
    const { categories } = get()
    const updated = categories.filter(cat => cat.id !== id)
    localStorage.setItem('pfm_categories', JSON.stringify(updated))
    set({ categories: updated })
  },

  addSubcategory: async (parentId: string, name: string) => {
    const { categories } = get()
    const newSubcategory: Subcategory = {
      id: generateId(),
      name: name.trim(),
      parentId,
    }

    const updated = categories.map(cat => {
      if (cat.id === parentId) {
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSubcategory],
        }
      }
      return cat
    })

    localStorage.setItem('pfm_categories', JSON.stringify(updated))
    set({ categories: updated })

    return newSubcategory
  },

  deleteSubcategory: async (parentId: string, subcategoryId: string) => {
    const { categories } = get()
    const updated = categories.map(cat => {
      if (cat.id === parentId) {
        return {
          ...cat,
          subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId),
        }
      }
      return cat
    })

    localStorage.setItem('pfm_categories', JSON.stringify(updated))
    set({ categories: updated })
  },

  getCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id)
  },

  getCategoriesByType: (type: Category['type']) => {
    return get().categories.filter(cat => cat.type === type)
  },
}))
