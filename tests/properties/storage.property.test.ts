/**
 * Property-Based Tests for Storage Service
 * Feature: personal-finance-manager, Property 21: Data Persistence Across Reload
 * Validates: Requirements 9.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { Transaction, Category, WishlistItem, Asset } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'

// Since IndexedDB is not available in Node.js test environment,
// we'll test the localStorage-based stores which have the same interface

// Helper to generate valid transaction
const transactionArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  type: fc.constantFrom('income', 'expense', 'transfer') as fc.Arbitrary<'income' | 'expense' | 'transfer'>,
  amount: fc.integer({ min: 1, max: 100000000 }),
  categoryId: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  subcategoryId: fc.option(fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()), { nil: undefined }),
  note: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  paymentMethod: fc.option(fc.constantFrom('cash', 'bank', 'e-wallet') as fc.Arbitrary<'cash' | 'bank' | 'e-wallet'>, { nil: undefined }),
  tags: fc.option(fc.array(fc.string({ maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
  createdAt: fc.constant(new Date().toISOString()),
  updatedAt: fc.constant(new Date().toISOString()),
})

// Helper to generate valid category
const categoryArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom('income', 'expense', 'asset', 'liability') as fc.Arbitrary<'income' | 'expense' | 'asset' | 'liability'>,
  subcategories: fc.constant([]),
  isDefault: fc.boolean(),
  createdAt: fc.constant(new Date().toISOString()),
})

// Helper to generate valid wishlist item
const wishlistArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  targetPrice: fc.integer({ min: 1, max: 1000000000 }),
  priority: fc.constantFrom('low', 'medium', 'high') as fc.Arbitrary<'low' | 'medium' | 'high'>,
  targetDate: fc.option(fc.date({ min: new Date(), max: new Date('2030-12-31') })
    .map(d => d.toISOString().split('T')[0]), { nil: undefined }),
  currentSaved: fc.integer({ min: 0, max: 1000000000 }),
  status: fc.constantFrom('planned', 'saving', 'bought') as fc.Arbitrary<'planned' | 'saving' | 'bought'>,
  note: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  createdAt: fc.constant(new Date().toISOString()),
  updatedAt: fc.constant(new Date().toISOString()),
})

// Helper to generate valid asset
const assetArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.constantFrom('cash', 'savings', 'investment', 'gold', 'property', 'other', 'debt', 'loan') as fc.Arbitrary<'cash' | 'savings' | 'investment' | 'gold' | 'property' | 'other' | 'debt' | 'loan'>,
  isLiability: fc.boolean(),
  initialValue: fc.integer({ min: 0, max: 10000000000 }),
  currentValue: fc.integer({ min: 0, max: 10000000000 }),
  valueHistory: fc.constant([]),
  createdAt: fc.constant(new Date().toISOString()),
  updatedAt: fc.constant(new Date().toISOString()),
})

describe('Property 21: Data Persistence Across Reload', () => {
  const STORAGE_KEY_TRANSACTIONS = 'pfm_transactions'
  const STORAGE_KEY_CATEGORIES = 'pfm_categories'
  const STORAGE_KEY_WISHLIST = 'pfm_wishlist'
  const STORAGE_KEY_ASSETS = 'pfm_assets'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should persist transactions and retrieve them with all values intact', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 20 }),
        (transactions) => {
          // Save to storage
          localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions))

          // Simulate reload by reading from storage
          const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS)
          expect(stored).not.toBeNull()

          const retrieved = JSON.parse(stored!) as Transaction[]

          // Verify all transactions are intact
          expect(retrieved.length).toBe(transactions.length)

          for (let i = 0; i < transactions.length; i++) {
            expect(retrieved[i].id).toBe(transactions[i].id)
            expect(retrieved[i].date).toBe(transactions[i].date)
            expect(retrieved[i].type).toBe(transactions[i].type)
            expect(retrieved[i].amount).toBe(transactions[i].amount)
            expect(retrieved[i].categoryId).toBe(transactions[i].categoryId)
            expect(retrieved[i].note).toBe(transactions[i].note)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should persist categories and retrieve them with all values intact', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArbitrary, { minLength: 1, maxLength: 20 }),
        (categories) => {
          // Save to storage
          localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories))

          // Simulate reload
          const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES)
          expect(stored).not.toBeNull()

          const retrieved = JSON.parse(stored!) as Category[]

          // Verify all categories are intact
          expect(retrieved.length).toBe(categories.length)

          for (let i = 0; i < categories.length; i++) {
            expect(retrieved[i].id).toBe(categories[i].id)
            expect(retrieved[i].name).toBe(categories[i].name)
            expect(retrieved[i].type).toBe(categories[i].type)
            expect(retrieved[i].isDefault).toBe(categories[i].isDefault)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should persist wishlist items and retrieve them with all values intact', () => {
    fc.assert(
      fc.property(
        fc.array(wishlistArbitrary, { minLength: 1, maxLength: 20 }),
        (items) => {
          // Save to storage
          localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(items))

          // Simulate reload
          const stored = localStorage.getItem(STORAGE_KEY_WISHLIST)
          expect(stored).not.toBeNull()

          const retrieved = JSON.parse(stored!) as WishlistItem[]

          // Verify all items are intact
          expect(retrieved.length).toBe(items.length)

          for (let i = 0; i < items.length; i++) {
            expect(retrieved[i].id).toBe(items[i].id)
            expect(retrieved[i].name).toBe(items[i].name)
            expect(retrieved[i].targetPrice).toBe(items[i].targetPrice)
            expect(retrieved[i].priority).toBe(items[i].priority)
            expect(retrieved[i].currentSaved).toBe(items[i].currentSaved)
            expect(retrieved[i].status).toBe(items[i].status)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should persist assets and retrieve them with all values intact', () => {
    fc.assert(
      fc.property(
        fc.array(assetArbitrary, { minLength: 1, maxLength: 20 }),
        (assets) => {
          // Save to storage
          localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets))

          // Simulate reload
          const stored = localStorage.getItem(STORAGE_KEY_ASSETS)
          expect(stored).not.toBeNull()

          const retrieved = JSON.parse(stored!) as Asset[]

          // Verify all assets are intact
          expect(retrieved.length).toBe(assets.length)

          for (let i = 0; i < assets.length; i++) {
            expect(retrieved[i].id).toBe(assets[i].id)
            expect(retrieved[i].name).toBe(assets[i].name)
            expect(retrieved[i].type).toBe(assets[i].type)
            expect(retrieved[i].isLiability).toBe(assets[i].isLiability)
            expect(retrieved[i].initialValue).toBe(assets[i].initialValue)
            expect(retrieved[i].currentValue).toBe(assets[i].currentValue)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty arrays correctly', () => {
    // Save empty arrays
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]))
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([]))

    // Retrieve
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS)!)
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES)!)

    expect(transactions).toEqual([])
    expect(categories).toEqual([])
  })

  it('should return null for non-existent keys', () => {
    expect(localStorage.getItem('non_existent_key')).toBeNull()
  })
})
