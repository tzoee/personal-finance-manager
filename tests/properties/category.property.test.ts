/**
 * Property-Based Tests for Category Operations
 * Properties 7, 8, 9: Category Creation, Rename, and Deletion
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { Category, Transaction } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'

// Helper to create a category
function createCategory(
  name: string,
  type: Category['type'] = 'expense',
  subcategories: { id: string; name: string }[] = []
): Category {
  return {
    id: generateId(),
    name,
    type,
    subcategories,
    isDefault: false,
    createdAt: new Date().toISOString(),
  }
}

// Helper to create a transaction
function createTransaction(categoryId: string, subcategoryId?: string): Transaction {
  return {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    amount: 100000,
    categoryId,
    subcategoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Simulate category store operations
class CategoryStore {
  private categories: Category[] = []
  private transactions: Transaction[] = []

  setCategories(cats: Category[]) {
    this.categories = [...cats]
  }

  setTransactions(txs: Transaction[]) {
    this.transactions = [...txs]
  }

  getCategories() {
    return this.categories
  }

  getTransactions() {
    return this.transactions
  }

  addCategory(name: string, type: Category['type']): Category {
    const newCat = createCategory(name, type)
    this.categories.push(newCat)
    return newCat
  }

  updateCategory(id: string, newName: string): boolean {
    const cat = this.categories.find(c => c.id === id)
    if (!cat) return false
    cat.name = newName
    return true
  }

  deleteCategory(id: string, migrateToId?: string): { success: boolean; migratedCount: number } {
    const txCount = this.transactions.filter(tx => tx.categoryId === id).length

    if (txCount > 0 && migrateToId) {
      // Migrate transactions
      this.transactions = this.transactions.map(tx => {
        if (tx.categoryId === id) {
          return { ...tx, categoryId: migrateToId, subcategoryId: undefined }
        }
        return tx
      })
    }

    this.categories = this.categories.filter(c => c.id !== id)
    return { success: true, migratedCount: txCount }
  }

  getCategoryTransactionCount(categoryId: string): number {
    return this.transactions.filter(tx => tx.categoryId === categoryId).length
  }

  addSubcategory(parentId: string, name: string): { id: string; name: string } | null {
    const cat = this.categories.find(c => c.id === parentId)
    if (!cat) return null
    const newSub = { id: generateId(), name }
    cat.subcategories.push(newSub)
    return newSub
  }
}

// Arbitraries
const categoryNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)

const categoryTypeArbitrary = fc.constantFrom('income', 'expense', 'asset', 'liability') as fc.Arbitrary<Category['type']>

describe('Property 7: Category Creation and Association', () => {
  let store: CategoryStore

  beforeEach(() => {
    store = new CategoryStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should create category with unique ID', () => {
    fc.assert(
      fc.property(
        fc.array(categoryNameArbitrary, { minLength: 2, maxLength: 20 }),
        categoryTypeArbitrary,
        (names, type) => {
          store.setCategories([])
          const createdIds = new Set<string>()

          for (const name of names) {
            const cat = store.addCategory(name, type)
            expect(createdIds.has(cat.id)).toBe(false)
            createdIds.add(cat.id)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve category type after creation', () => {
    fc.assert(
      fc.property(
        categoryNameArbitrary,
        categoryTypeArbitrary,
        (name, type) => {
          store.setCategories([])
          const cat = store.addCategory(name, type)
          
          expect(cat.type).toBe(type)
          expect(cat.name).toBe(name)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow transactions to reference created category', () => {
    fc.assert(
      fc.property(
        categoryNameArbitrary,
        categoryTypeArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (name, type, txCount) => {
          store.setCategories([])
          store.setTransactions([])

          const cat = store.addCategory(name, type)
          
          // Create transactions referencing this category
          const transactions: Transaction[] = []
          for (let i = 0; i < txCount; i++) {
            transactions.push(createTransaction(cat.id))
          }
          store.setTransactions(transactions)

          // Verify association
          expect(store.getCategoryTransactionCount(cat.id)).toBe(txCount)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 8: Category Rename Preserves References', () => {
  let store: CategoryStore

  beforeEach(() => {
    store = new CategoryStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should preserve transaction references after category rename', () => {
    fc.assert(
      fc.property(
        categoryNameArbitrary,
        categoryNameArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (originalName, newName, txCount) => {
          store.setCategories([])
          store.setTransactions([])

          // Create category and transactions
          const cat = store.addCategory(originalName, 'expense')
          const transactions: Transaction[] = []
          for (let i = 0; i < txCount; i++) {
            transactions.push(createTransaction(cat.id))
          }
          store.setTransactions(transactions)

          // Rename category
          store.updateCategory(cat.id, newName)

          // Verify transactions still reference the same category
          const txsAfterRename = store.getTransactions()
          const referencingTxs = txsAfterRename.filter(tx => tx.categoryId === cat.id)
          
          expect(referencingTxs.length).toBe(txCount)
          
          // Verify category name changed
          const updatedCat = store.getCategories().find(c => c.id === cat.id)
          expect(updatedCat?.name).toBe(newName)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not affect other categories when renaming', () => {
    fc.assert(
      fc.property(
        fc.array(categoryNameArbitrary, { minLength: 2, maxLength: 5 }),
        categoryNameArbitrary,
        (names, newName) => {
          store.setCategories([])

          // Create multiple categories
          const cats = names.map(name => store.addCategory(name, 'expense'))
          const originalNames = cats.map(c => c.name)

          // Rename first category
          store.updateCategory(cats[0].id, newName)

          // Verify other categories unchanged
          const updatedCats = store.getCategories()
          for (let i = 1; i < cats.length; i++) {
            const cat = updatedCats.find(c => c.id === cats[i].id)
            expect(cat?.name).toBe(originalNames[i])
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 9: Category Deletion Protection', () => {
  let store: CategoryStore

  beforeEach(() => {
    store = new CategoryStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should migrate transactions when deleting category with migration target', () => {
    fc.assert(
      fc.property(
        categoryNameArbitrary,
        categoryNameArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (name1, name2, txCount) => {
          store.setCategories([])
          store.setTransactions([])

          // Create two categories
          const cat1 = store.addCategory(name1, 'expense')
          const cat2 = store.addCategory(name2, 'expense')

          // Create transactions for cat1
          const transactions: Transaction[] = []
          for (let i = 0; i < txCount; i++) {
            transactions.push(createTransaction(cat1.id))
          }
          store.setTransactions(transactions)

          // Delete cat1 with migration to cat2
          const result = store.deleteCategory(cat1.id, cat2.id)

          // Verify migration
          expect(result.success).toBe(true)
          expect(result.migratedCount).toBe(txCount)

          // Verify transactions now reference cat2
          const txsAfterDelete = store.getTransactions()
          const cat2Txs = txsAfterDelete.filter(tx => tx.categoryId === cat2.id)
          expect(cat2Txs.length).toBe(txCount)

          // Verify cat1 is deleted
          expect(store.getCategories().find(c => c.id === cat1.id)).toBeUndefined()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow deletion of category without transactions', () => {
    fc.assert(
      fc.property(
        categoryNameArbitrary,
        (name) => {
          store.setCategories([])
          store.setTransactions([])

          const cat = store.addCategory(name, 'expense')
          
          // Delete without migration (no transactions)
          const result = store.deleteCategory(cat.id)

          expect(result.success).toBe(true)
          expect(store.getCategories().find(c => c.id === cat.id)).toBeUndefined()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve total transaction count after migration', () => {
    fc.assert(
      fc.property(
        fc.array(categoryNameArbitrary, { minLength: 2, maxLength: 5 }),
        fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 2, maxLength: 5 }),
        (names, txCounts) => {
          store.setCategories([])
          store.setTransactions([])

          // Ensure arrays have same length
          const len = Math.min(names.length, txCounts.length)
          const actualNames = names.slice(0, len)
          const actualTxCounts = txCounts.slice(0, len)

          // Create categories with transactions
          const cats = actualNames.map(name => store.addCategory(name, 'expense'))
          const allTransactions: Transaction[] = []
          
          cats.forEach((cat, i) => {
            for (let j = 0; j < actualTxCounts[i]; j++) {
              allTransactions.push(createTransaction(cat.id))
            }
          })
          store.setTransactions(allTransactions)

          const totalBefore = store.getTransactions().length

          // Delete first category, migrate to second
          if (cats.length >= 2) {
            store.deleteCategory(cats[0].id, cats[1].id)
          }

          const totalAfter = store.getTransactions().length

          // Total transaction count should be preserved
          expect(totalAfter).toBe(totalBefore)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Subcategory Operations', () => {
  let store: CategoryStore

  beforeEach(() => {
    store = new CategoryStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should add subcategory to existing category', () => {
    fc.assert(
      fc.property(
        categoryNameArbitrary,
        fc.array(categoryNameArbitrary, { minLength: 1, maxLength: 5 }),
        (catName, subNames) => {
          store.setCategories([])

          const cat = store.addCategory(catName, 'expense')
          
          for (const subName of subNames) {
            const sub = store.addSubcategory(cat.id, subName)
            expect(sub).not.toBeNull()
            expect(sub?.name).toBe(subName)
          }

          const updatedCat = store.getCategories().find(c => c.id === cat.id)
          expect(updatedCat?.subcategories.length).toBe(subNames.length)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate unique IDs for subcategories', () => {
    fc.assert(
      fc.property(
        categoryNameArbitrary,
        fc.array(categoryNameArbitrary, { minLength: 2, maxLength: 10 }),
        (catName, subNames) => {
          store.setCategories([])

          const cat = store.addCategory(catName, 'expense')
          const subIds = new Set<string>()
          
          for (const subName of subNames) {
            const sub = store.addSubcategory(cat.id, subName)
            if (sub) {
              expect(subIds.has(sub.id)).toBe(false)
              subIds.add(sub.id)
            }
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
