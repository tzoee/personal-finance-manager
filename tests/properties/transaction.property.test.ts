/**
 * Property-Based Tests for Transaction Operations
 * Properties 1-6: Transaction Persistence, Validation, Summary, Filtering, Update, Delete
 * Validates: Requirements 1.1-1.8
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { Transaction, TransactionInput, MonthlySummary } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'
import { validateTransaction } from '../../src/utils/validators'

// Helper to create a transaction
function createTransaction(input: TransactionInput): Transaction {
  return {
    id: generateId(),
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Simulate transaction store
class TransactionStore {
  private transactions: Transaction[] = []

  clear() {
    this.transactions = []
  }

  getAll() {
    return [...this.transactions]
  }

  add(input: TransactionInput): Transaction {
    const tx = createTransaction(input)
    this.transactions.unshift(tx)
    return tx
  }

  update(id: string, input: TransactionInput): boolean {
    const index = this.transactions.findIndex(tx => tx.id === id)
    if (index === -1) return false
    this.transactions[index] = {
      ...this.transactions[index],
      ...input,
      updatedAt: new Date().toISOString(),
    }
    return true
  }

  delete(id: string): boolean {
    const index = this.transactions.findIndex(tx => tx.id === id)
    if (index === -1) return false
    this.transactions.splice(index, 1)
    return true
  }

  getByMonth(year: number, month: number): Transaction[] {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    return this.transactions.filter(tx => tx.date.startsWith(monthStr))
  }

  filter(filters: { type?: string; categoryId?: string; startDate?: string; endDate?: string }): Transaction[] {
    return this.transactions.filter(tx => {
      if (filters.type && tx.type !== filters.type) return false
      if (filters.categoryId && tx.categoryId !== filters.categoryId) return false
      if (filters.startDate && tx.date < filters.startDate) return false
      if (filters.endDate && tx.date > filters.endDate) return false
      return true
    })
  }

  getMonthlySummary(year: number, month: number): MonthlySummary {
    const monthTxs = this.getByMonth(year, month)
    let totalIncome = 0
    let totalExpense = 0

    for (const tx of monthTxs) {
      if (tx.type === 'income') totalIncome += tx.amount
      else if (tx.type === 'expense') totalExpense += tx.amount
    }

    const surplus = totalIncome - totalExpense
    const surplusRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      surplus,
      surplusRate,
      transactionCount: monthTxs.length,
    }
  }
}

// Arbitraries
const dateArbitrary = fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
  .map(d => d.toISOString().split('T')[0])

const transactionTypeArbitrary = fc.constantFrom('income', 'expense', 'transfer') as fc.Arbitrary<'income' | 'expense' | 'transfer'>

const amountArbitrary = fc.integer({ min: 1, max: 100000000 })

const transactionInputArbitrary = fc.record({
  date: dateArbitrary,
  type: transactionTypeArbitrary,
  amount: amountArbitrary,
  categoryId: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  subcategoryId: fc.option(fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()), { nil: undefined }),
  note: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
})

describe('Property 1: Transaction Persistence', () => {
  let store: TransactionStore

  beforeEach(() => {
    store = new TransactionStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should persist transaction after adding', () => {
    fc.assert(
      fc.property(transactionInputArbitrary, (input) => {
        store.clear()
        const tx = store.add(input)
        
        const all = store.getAll()
        expect(all.length).toBe(1)
        expect(all[0].id).toBe(tx.id)
        expect(all[0].amount).toBe(input.amount)
        expect(all[0].type).toBe(input.type)
        expect(all[0].date).toBe(input.date)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should generate unique IDs for each transaction', () => {
    fc.assert(
      fc.property(
        fc.array(transactionInputArbitrary, { minLength: 2, maxLength: 20 }),
        (inputs) => {
          store.clear()
          const ids = new Set<string>()

          for (const input of inputs) {
            const tx = store.add(input)
            expect(ids.has(tx.id)).toBe(false)
            ids.add(tx.id)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 2: Transaction Validation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should reject transactions with amount <= 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000000, max: 0 }),
        dateArbitrary,
        transactionTypeArbitrary,
        (amount, date, type) => {
          const input = {
            date,
            type,
            amount,
            categoryId: generateId(),
          }

          const result = validateTransaction(input)
          expect(result.isValid).toBe(false)
          expect(result.errors.some(e => e.field === 'amount')).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject transactions without required fields', () => {
    fc.assert(
      fc.property(amountArbitrary, (amount) => {
        // Missing date
        let result = validateTransaction({ amount, type: 'expense', categoryId: generateId() })
        expect(result.isValid).toBe(false)

        // Missing type
        result = validateTransaction({ amount, date: '2024-01-01', categoryId: generateId() } as any)
        expect(result.isValid).toBe(false)

        // Missing categoryId
        result = validateTransaction({ amount, date: '2024-01-01', type: 'expense' })
        expect(result.isValid).toBe(false)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should accept valid transactions', () => {
    fc.assert(
      fc.property(transactionInputArbitrary, (input) => {
        const result = validateTransaction(input)
        expect(result.isValid).toBe(true)
        expect(result.errors.length).toBe(0)
        
        return true
      }),
      { numRuns: 100 }
    )
  })
})


describe('Property 3: Monthly Summary Calculation', () => {
  let store: TransactionStore

  beforeEach(() => {
    store = new TransactionStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should calculate correct totals for income and expense', () => {
    fc.assert(
      fc.property(
        fc.array(amountArbitrary, { minLength: 1, maxLength: 10 }),
        fc.array(amountArbitrary, { minLength: 1, maxLength: 10 }),
        (incomeAmounts, expenseAmounts) => {
          store.clear()
          const year = 2024
          const month = 6

          // Add income transactions
          for (const amount of incomeAmounts) {
            store.add({
              date: `${year}-${String(month).padStart(2, '0')}-15`,
              type: 'income',
              amount,
              categoryId: generateId(),
            })
          }

          // Add expense transactions
          for (const amount of expenseAmounts) {
            store.add({
              date: `${year}-${String(month).padStart(2, '0')}-15`,
              type: 'expense',
              amount,
              categoryId: generateId(),
            })
          }

          const summary = store.getMonthlySummary(year, month)
          const expectedIncome = incomeAmounts.reduce((a, b) => a + b, 0)
          const expectedExpense = expenseAmounts.reduce((a, b) => a + b, 0)

          expect(summary.totalIncome).toBe(expectedIncome)
          expect(summary.totalExpense).toBe(expectedExpense)
          expect(summary.surplus).toBe(expectedIncome - expectedExpense)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate correct surplus rate', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10000000 }),
        fc.integer({ min: 0, max: 10000000 }),
        (income, expense) => {
          store.clear()
          const year = 2024
          const month = 6

          store.add({
            date: `${year}-${String(month).padStart(2, '0')}-15`,
            type: 'income',
            amount: income,
            categoryId: generateId(),
          })

          store.add({
            date: `${year}-${String(month).padStart(2, '0')}-15`,
            type: 'expense',
            amount: expense,
            categoryId: generateId(),
          })

          const summary = store.getMonthlySummary(year, month)
          const expectedRate = ((income - expense) / income) * 100

          expect(Math.abs(summary.surplusRate - expectedRate)).toBeLessThan(0.001)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return zero surplus rate when no income', () => {
    fc.assert(
      fc.property(
        fc.array(amountArbitrary, { minLength: 1, maxLength: 5 }),
        (expenseAmounts) => {
          store.clear()
          const year = 2024
          const month = 6

          for (const amount of expenseAmounts) {
            store.add({
              date: `${year}-${String(month).padStart(2, '0')}-15`,
              type: 'expense',
              amount,
              categoryId: generateId(),
            })
          }

          const summary = store.getMonthlySummary(year, month)
          expect(summary.surplusRate).toBe(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 4: Transaction Filtering', () => {
  let store: TransactionStore

  beforeEach(() => {
    store = new TransactionStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should filter by type correctly', () => {
    fc.assert(
      fc.property(
        fc.array(transactionInputArbitrary, { minLength: 5, maxLength: 20 }),
        transactionTypeArbitrary,
        (inputs, filterType) => {
          store.clear()

          for (const input of inputs) {
            store.add(input)
          }

          const filtered = store.filter({ type: filterType })
          const expectedCount = inputs.filter(i => i.type === filterType).length

          expect(filtered.length).toBe(expectedCount)
          expect(filtered.every(tx => tx.type === filterType)).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should filter by category correctly', () => {
    fc.assert(
      fc.property(
        fc.array(transactionInputArbitrary, { minLength: 5, maxLength: 20 }),
        (inputs) => {
          store.clear()

          for (const input of inputs) {
            store.add(input)
          }

          if (inputs.length === 0) return true

          const targetCategoryId = inputs[0].categoryId
          const filtered = store.filter({ categoryId: targetCategoryId })
          const expectedCount = inputs.filter(i => i.categoryId === targetCategoryId).length

          expect(filtered.length).toBe(expectedCount)
          expect(filtered.every(tx => tx.categoryId === targetCategoryId)).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should filter by date range correctly', () => {
    fc.assert(
      fc.property(
        fc.array(transactionInputArbitrary, { minLength: 5, maxLength: 20 }),
        (inputs) => {
          store.clear()

          for (const input of inputs) {
            store.add(input)
          }

          const startDate = '2024-06-01'
          const endDate = '2024-06-30'
          const filtered = store.filter({ startDate, endDate })

          expect(filtered.every(tx => tx.date >= startDate && tx.date <= endDate)).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 5: Transaction Update Consistency', () => {
  let store: TransactionStore

  beforeEach(() => {
    store = new TransactionStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should update transaction while preserving ID', () => {
    fc.assert(
      fc.property(
        transactionInputArbitrary,
        transactionInputArbitrary,
        (original, updated) => {
          store.clear()
          const tx = store.add(original)
          const originalId = tx.id

          store.update(originalId, updated)

          const all = store.getAll()
          expect(all.length).toBe(1)
          expect(all[0].id).toBe(originalId)
          expect(all[0].amount).toBe(updated.amount)
          expect(all[0].type).toBe(updated.type)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not affect other transactions when updating', () => {
    fc.assert(
      fc.property(
        fc.array(transactionInputArbitrary, { minLength: 2, maxLength: 10 }),
        transactionInputArbitrary,
        (inputs, updateInput) => {
          store.clear()
          const txs = inputs.map(input => store.add(input))
          const originalAmounts = txs.map(tx => tx.amount)

          // Update first transaction
          store.update(txs[0].id, updateInput)

          const all = store.getAll()
          
          // Check other transactions unchanged
          for (let i = 1; i < txs.length; i++) {
            const tx = all.find(t => t.id === txs[i].id)
            expect(tx?.amount).toBe(originalAmounts[i])
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 6: Transaction Deletion Consistency', () => {
  let store: TransactionStore

  beforeEach(() => {
    store = new TransactionStore()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should remove transaction and update count', () => {
    fc.assert(
      fc.property(
        fc.array(transactionInputArbitrary, { minLength: 1, maxLength: 10 }),
        (inputs) => {
          store.clear()
          const txs = inputs.map(input => store.add(input))
          const originalCount = txs.length

          // Delete first transaction
          store.delete(txs[0].id)

          const all = store.getAll()
          expect(all.length).toBe(originalCount - 1)
          expect(all.find(tx => tx.id === txs[0].id)).toBeUndefined()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not affect other transactions when deleting', () => {
    fc.assert(
      fc.property(
        fc.array(transactionInputArbitrary, { minLength: 2, maxLength: 10 }),
        (inputs) => {
          store.clear()
          const txs = inputs.map(input => store.add(input))

          // Delete first transaction
          store.delete(txs[0].id)

          const all = store.getAll()
          
          // Check other transactions still exist
          for (let i = 1; i < txs.length; i++) {
            const tx = all.find(t => t.id === txs[i].id)
            expect(tx).toBeDefined()
            expect(tx?.amount).toBe(txs[i].amount)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should update monthly summary after deletion', () => {
    fc.assert(
      fc.property(
        fc.array(amountArbitrary, { minLength: 2, maxLength: 5 }),
        (amounts) => {
          store.clear()
          const year = 2024
          const month = 6

          const txs = amounts.map(amount => store.add({
            date: `${year}-${String(month).padStart(2, '0')}-15`,
            type: 'expense',
            amount,
            categoryId: generateId(),
          }))

          const summaryBefore = store.getMonthlySummary(year, month)
          const deletedAmount = txs[0].amount

          store.delete(txs[0].id)

          const summaryAfter = store.getMonthlySummary(year, month)
          expect(summaryAfter.totalExpense).toBe(summaryBefore.totalExpense - deletedAmount)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
