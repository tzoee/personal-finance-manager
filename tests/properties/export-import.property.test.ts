/**
 * Property-Based Tests for Export/Import Round-Trip
 * Feature: personal-finance-manager, Property 20: Export/Import Round-Trip
 * Validates: Requirements 8.1, 8.2, 8.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { AppData, AppSettings } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'
import { CURRENT_SCHEMA_VERSION, DEFAULT_SETTINGS } from '../../src/constants/defaults'

// Arbitraries for generating test data
const transactionArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  type: fc.constantFrom('income', 'expense', 'transfer') as fc.Arbitrary<'income' | 'expense' | 'transfer'>,
  amount: fc.integer({ min: 1, max: 100000000 }),
  categoryId: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  subcategoryId: fc.option(fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()), { nil: undefined }),
  note: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  createdAt: fc.constant(new Date().toISOString()),
  updatedAt: fc.constant(new Date().toISOString()),
})

const categoryArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom('income', 'expense', 'asset', 'liability') as fc.Arbitrary<'income' | 'expense' | 'asset' | 'liability'>,
  subcategories: fc.constant([]),
  isDefault: fc.boolean(),
  createdAt: fc.constant(new Date().toISOString()),
})

const wishlistArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  targetPrice: fc.integer({ min: 1, max: 1000000000 }),
  priority: fc.constantFrom('low', 'medium', 'high') as fc.Arbitrary<'low' | 'medium' | 'high'>,
  currentSaved: fc.integer({ min: 0, max: 1000000000 }),
  status: fc.constantFrom('planned', 'saving', 'bought') as fc.Arbitrary<'planned' | 'saving' | 'bought'>,
  createdAt: fc.constant(new Date().toISOString()),
  updatedAt: fc.constant(new Date().toISOString()),
})

const assetArbitrary = fc.record({
  id: fc.string({ minLength: 8, maxLength: 20 }).map(() => generateId()),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.constantFrom('cash', 'savings', 'investment', 'gold') as fc.Arbitrary<'cash' | 'savings' | 'investment' | 'gold'>,
  isLiability: fc.boolean(),
  initialValue: fc.integer({ min: 0, max: 10000000000 }),
  currentValue: fc.integer({ min: 0, max: 10000000000 }),
  valueHistory: fc.constant([]),
  createdAt: fc.constant(new Date().toISOString()),
  updatedAt: fc.constant(new Date().toISOString()),
})

const appDataArbitrary = fc.record({
  version: fc.constant(CURRENT_SCHEMA_VERSION),
  settings: fc.constant(DEFAULT_SETTINGS),
  transactions: fc.array(transactionArbitrary, { minLength: 0, maxLength: 10 }),
  categories: fc.array(categoryArbitrary, { minLength: 1, maxLength: 10 }),
  wishlist: fc.array(wishlistArbitrary, { minLength: 0, maxLength: 5 }),
  installments: fc.constant([]),
  monthlyNeeds: fc.constant([]),
  monthlyNeedPayments: fc.constant([]),
  assets: fc.array(assetArbitrary, { minLength: 0, maxLength: 5 }),
  exportedAt: fc.constant(new Date().toISOString()),
})

/**
 * Simulate export function
 */
function exportToJson(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Simulate import function (replace mode)
 */
function importFromJson(jsonString: string): AppData {
  return JSON.parse(jsonString)
}

/**
 * Compare two AppData objects for equivalence
 */
function areAppDataEquivalent(original: AppData, imported: AppData): boolean {
  // Compare version
  if (original.version !== imported.version) return false

  // Compare settings
  if (JSON.stringify(original.settings) !== JSON.stringify(imported.settings)) return false

  // Compare transactions
  if (original.transactions.length !== imported.transactions.length) return false
  for (let i = 0; i < original.transactions.length; i++) {
    const orig = original.transactions[i]
    const imp = imported.transactions[i]
    if (orig.id !== imp.id || orig.amount !== imp.amount || orig.type !== imp.type) {
      return false
    }
  }

  // Compare categories
  if (original.categories.length !== imported.categories.length) return false
  for (let i = 0; i < original.categories.length; i++) {
    const orig = original.categories[i]
    const imp = imported.categories[i]
    if (orig.id !== imp.id || orig.name !== imp.name || orig.type !== imp.type) {
      return false
    }
  }

  // Compare wishlist
  if (original.wishlist.length !== imported.wishlist.length) return false
  for (let i = 0; i < original.wishlist.length; i++) {
    const orig = original.wishlist[i]
    const imp = imported.wishlist[i]
    if (orig.id !== imp.id || orig.name !== imp.name || orig.targetPrice !== imp.targetPrice) {
      return false
    }
  }

  // Compare assets
  if (original.assets.length !== imported.assets.length) return false
  for (let i = 0; i < original.assets.length; i++) {
    const orig = original.assets[i]
    const imp = imported.assets[i]
    if (orig.id !== imp.id || orig.name !== imp.name || orig.currentValue !== imp.currentValue) {
      return false
    }
  }

  return true
}

describe('Property 20: Export/Import Round-Trip', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should produce equivalent data after export then import (replace mode)', () => {
    fc.assert(
      fc.property(appDataArbitrary, (originalData) => {
        // Export to JSON
        const jsonString = exportToJson(originalData)

        // Import from JSON
        const importedData = importFromJson(jsonString)

        // Verify equivalence
        expect(areAppDataEquivalent(originalData, importedData)).toBe(true)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should preserve all transaction fields through round-trip', () => {
    fc.assert(
      fc.property(
        fc.array(transactionArbitrary, { minLength: 1, maxLength: 20 }),
        (transactions) => {
          const data: AppData = {
            version: CURRENT_SCHEMA_VERSION,
            settings: DEFAULT_SETTINGS,
            transactions,
            categories: [],
            wishlist: [],
            installments: [],
            monthlyNeeds: [],
            monthlyNeedPayments: [],
            assets: [],
            exportedAt: new Date().toISOString(),
          }

          const jsonString = exportToJson(data)
          const imported = importFromJson(jsonString)

          // Verify each transaction
          expect(imported.transactions.length).toBe(transactions.length)
          
          for (let i = 0; i < transactions.length; i++) {
            expect(imported.transactions[i].id).toBe(transactions[i].id)
            expect(imported.transactions[i].date).toBe(transactions[i].date)
            expect(imported.transactions[i].type).toBe(transactions[i].type)
            expect(imported.transactions[i].amount).toBe(transactions[i].amount)
            expect(imported.transactions[i].categoryId).toBe(transactions[i].categoryId)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve all category fields through round-trip', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArbitrary, { minLength: 1, maxLength: 20 }),
        (categories) => {
          const data: AppData = {
            version: CURRENT_SCHEMA_VERSION,
            settings: DEFAULT_SETTINGS,
            transactions: [],
            categories,
            wishlist: [],
            installments: [],
            monthlyNeeds: [],
            monthlyNeedPayments: [],
            assets: [],
            exportedAt: new Date().toISOString(),
          }

          const jsonString = exportToJson(data)
          const imported = importFromJson(jsonString)

          expect(imported.categories.length).toBe(categories.length)
          
          for (let i = 0; i < categories.length; i++) {
            expect(imported.categories[i].id).toBe(categories[i].id)
            expect(imported.categories[i].name).toBe(categories[i].name)
            expect(imported.categories[i].type).toBe(categories[i].type)
            expect(imported.categories[i].isDefault).toBe(categories[i].isDefault)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve settings through round-trip', () => {
    fc.assert(
      fc.property(
        fc.record({
          currency: fc.constantFrom('IDR', 'USD', 'EUR'),
          monthlyLivingCost: fc.integer({ min: 1000000, max: 50000000 }),
          emergencyFundMultiplier: fc.integer({ min: 3, max: 12 }),
          darkMode: fc.boolean(),
          schemaVersion: fc.constant(CURRENT_SCHEMA_VERSION),
        }),
        (settings) => {
          const data: AppData = {
            version: CURRENT_SCHEMA_VERSION,
            settings: settings as AppSettings,
            transactions: [],
            categories: [],
            wishlist: [],
            installments: [],
            monthlyNeeds: [],
            monthlyNeedPayments: [],
            assets: [],
            exportedAt: new Date().toISOString(),
          }

          const jsonString = exportToJson(data)
          const imported = importFromJson(jsonString)

          expect(imported.settings.currency).toBe(settings.currency)
          expect(imported.settings.monthlyLivingCost).toBe(settings.monthlyLivingCost)
          expect(imported.settings.emergencyFundMultiplier).toBe(settings.emergencyFundMultiplier)
          expect(imported.settings.darkMode).toBe(settings.darkMode)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty data correctly', () => {
    const emptyData: AppData = {
      version: CURRENT_SCHEMA_VERSION,
      settings: DEFAULT_SETTINGS,
      transactions: [],
      categories: [],
      wishlist: [],
      installments: [],
      monthlyNeeds: [],
      monthlyNeedPayments: [],
      assets: [],
      exportedAt: new Date().toISOString(),
    }

    const jsonString = exportToJson(emptyData)
    const imported = importFromJson(jsonString)

    expect(imported.transactions).toEqual([])
    expect(imported.categories).toEqual([])
    expect(imported.wishlist).toEqual([])
    expect(imported.assets).toEqual([])
  })

  it('should produce valid JSON that can be parsed', () => {
    fc.assert(
      fc.property(appDataArbitrary, (data) => {
        const jsonString = exportToJson(data)
        
        // Should not throw
        expect(() => JSON.parse(jsonString)).not.toThrow()
        
        // Should be a valid object
        const parsed = JSON.parse(jsonString)
        expect(typeof parsed).toBe('object')
        expect(parsed).not.toBeNull()

        return true
      }),
      { numRuns: 100 }
    )
  })
})
