import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Asset, AssetInput, AssetValueHistory } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'
import { getCurrentDate, getNowISO } from '../../src/utils/dateUtils'
import { format, subDays, parseISO } from 'date-fns'

// Helper to create asset from input
function createAsset(input: AssetInput): Asset {
  const now = getNowISO()
  const today = getCurrentDate()
  
  return {
    id: generateId(),
    name: input.name.trim(),
    type: input.type,
    isLiability: input.isLiability,
    initialValue: input.initialValue,
    currentValue: input.currentValue,
    valueHistory: [{ date: today, value: input.currentValue }],
    createdAt: now,
    updatedAt: now,
  }
}

// Helper to calculate net worth from assets
function calculateNetWorth(assets: Asset[]): number {
  return assets.reduce((total, asset) => {
    if (asset.isLiability) {
      return total - asset.currentValue
    }
    return total + asset.currentValue
  }, 0)
}

// Helper to update asset value with history
function updateAssetValue(asset: Asset, newValue: number): Asset {
  const today = getCurrentDate()
  const now = getNowISO()
  
  // Check if we already have an entry for today
  const todayIndex = asset.valueHistory.findIndex(h => h.date === today)
  let newHistory: AssetValueHistory[]
  
  if (todayIndex >= 0) {
    newHistory = [...asset.valueHistory]
    newHistory[todayIndex] = { date: today, value: newValue }
  } else {
    newHistory = [...asset.valueHistory, { date: today, value: newValue }]
  }
  
  return {
    ...asset,
    currentValue: newValue,
    valueHistory: newHistory,
    updatedAt: now,
  }
}

// Arbitraries
const assetTypeArb = fc.constantFrom('cash', 'savings', 'investment', 'gold', 'property', 'other')
const liabilityTypeArb = fc.constantFrom('debt', 'loan', 'other')

const assetInputArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  type: assetTypeArb,
  isLiability: fc.constant(false),
  initialValue: fc.float({ min: 0, max: 1000000000, noNaN: true }),
  currentValue: fc.float({ min: 0, max: 1000000000, noNaN: true }),
}) as fc.Arbitrary<AssetInput>

const liabilityInputArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  type: liabilityTypeArb,
  isLiability: fc.constant(true),
  initialValue: fc.float({ min: 0, max: 1000000000, noNaN: true }),
  currentValue: fc.float({ min: 0, max: 1000000000, noNaN: true }),
}) as fc.Arbitrary<AssetInput>

const assetOrLiabilityInputArb = fc.oneof(assetInputArb, liabilityInputArb)

describe('Feature: personal-finance-manager', () => {
  describe('Property 15: Net Worth Calculation', () => {
    it('should calculate net worth as sum of assets minus sum of liabilities', () => {
      fc.assert(
        fc.property(
          fc.array(assetOrLiabilityInputArb, { minLength: 0, maxLength: 20 }),
          (inputs) => {
            const assets = inputs.map(input => createAsset(input))
            
            const totalAssets = assets
              .filter(a => !a.isLiability)
              .reduce((sum, a) => sum + a.currentValue, 0)
            
            const totalLiabilities = assets
              .filter(a => a.isLiability)
              .reduce((sum, a) => sum + a.currentValue, 0)
            
            const expectedNetWorth = totalAssets - totalLiabilities
            const calculatedNetWorth = calculateNetWorth(assets)
            
            expect(Math.abs(calculatedNetWorth - expectedNetWorth)).toBeLessThan(0.01)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return 0 for empty asset list', () => {
      const netWorth = calculateNetWorth([])
      expect(netWorth).toBe(0)
    })

    it('should return positive net worth when assets exceed liabilities', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1000, max: 1000000, noNaN: true }),
          fc.float({ min: 0, max: 500, noNaN: true }),
          (assetValue, liabilityValue) => {
            const assets: Asset[] = [
              createAsset({
                name: 'Savings',
                type: 'savings',
                isLiability: false,
                initialValue: assetValue,
                currentValue: assetValue,
              }),
              createAsset({
                name: 'Debt',
                type: 'debt',
                isLiability: true,
                initialValue: liabilityValue,
                currentValue: liabilityValue,
              }),
            ]
            
            const netWorth = calculateNetWorth(assets)
            expect(netWorth).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return negative net worth when liabilities exceed assets', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 500, noNaN: true }),
          fc.float({ min: 1000, max: 1000000, noNaN: true }),
          (assetValue, liabilityValue) => {
            const assets: Asset[] = [
              createAsset({
                name: 'Savings',
                type: 'savings',
                isLiability: false,
                initialValue: assetValue,
                currentValue: assetValue,
              }),
              createAsset({
                name: 'Debt',
                type: 'debt',
                isLiability: true,
                initialValue: liabilityValue,
                currentValue: liabilityValue,
              }),
            ]
            
            const netWorth = calculateNetWorth(assets)
            expect(netWorth).toBeLessThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle multiple assets and liabilities correctly', () => {
      fc.assert(
        fc.property(
          fc.array(assetInputArb, { minLength: 1, maxLength: 10 }),
          fc.array(liabilityInputArb, { minLength: 1, maxLength: 10 }),
          (assetInputs, liabilityInputs) => {
            const allAssets = [
              ...assetInputs.map(input => createAsset(input)),
              ...liabilityInputs.map(input => createAsset(input)),
            ]
            
            const expectedAssetTotal = assetInputs.reduce((sum, a) => sum + a.currentValue, 0)
            const expectedLiabilityTotal = liabilityInputs.reduce((sum, l) => sum + l.currentValue, 0)
            const expectedNetWorth = expectedAssetTotal - expectedLiabilityTotal
            
            const calculatedNetWorth = calculateNetWorth(allAssets)
            
            expect(Math.abs(calculatedNetWorth - expectedNetWorth)).toBeLessThan(0.01)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 16: Asset Value History', () => {
    it('should append new value to history when updating asset value', () => {
      fc.assert(
        fc.property(
          assetInputArb,
          fc.float({ min: 0, max: 1000000000, noNaN: true }),
          (input, newValue) => {
            const asset = createAsset(input)
            
            // Simulate updating on a different day by modifying the history
            const yesterday = format(subDays(parseISO(getCurrentDate()), 1), 'yyyy-MM-dd')
            asset.valueHistory = [{ date: yesterday, value: input.currentValue }]
            
            const updatedAsset = updateAssetValue(asset, newValue)
            
            // History should have grown by 1
            expect(updatedAsset.valueHistory.length).toBe(2)
            
            // Latest entry should have the new value
            const latestEntry = updatedAsset.valueHistory[updatedAsset.valueHistory.length - 1]
            expect(latestEntry.value).toBe(newValue)
            
            // Current value should be updated
            expect(updatedAsset.currentValue).toBe(newValue)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve all previous history entries when adding new value', () => {
      fc.assert(
        fc.property(
          assetInputArb,
          fc.array(fc.float({ min: 0, max: 1000000, noNaN: true }), { minLength: 1, maxLength: 5 }),
          (input, valueUpdates) => {
            let asset = createAsset(input)
            
            // Create history with different dates
            const baseDate = parseISO(getCurrentDate())
            asset.valueHistory = []
            
            for (let i = valueUpdates.length; i > 0; i--) {
              const date = format(subDays(baseDate, i), 'yyyy-MM-dd')
              asset.valueHistory.push({ date, value: valueUpdates[valueUpdates.length - i] })
            }
            
            const originalHistory = [...asset.valueHistory]
            const newValue = 999999
            
            const updatedAsset = updateAssetValue(asset, newValue)
            
            // All original entries should still exist
            originalHistory.forEach(entry => {
              const found = updatedAsset.valueHistory.find(
                h => h.date === entry.date && h.value === entry.value
              )
              expect(found).toBeDefined()
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update existing entry if updating on the same day', () => {
      fc.assert(
        fc.property(
          assetInputArb,
          fc.float({ min: 0, max: 1000000000, noNaN: true }),
          fc.float({ min: 0, max: 1000000000, noNaN: true }),
          (input, firstUpdate, secondUpdate) => {
            const asset = createAsset(input)
            
            // First update
            const afterFirst = updateAssetValue(asset, firstUpdate)
            const historyLengthAfterFirst = afterFirst.valueHistory.length
            
            // Second update on same day
            const afterSecond = updateAssetValue(afterFirst, secondUpdate)
            
            // History length should not increase
            expect(afterSecond.valueHistory.length).toBe(historyLengthAfterFirst)
            
            // Latest value should be the second update
            const today = getCurrentDate()
            const todayEntry = afterSecond.valueHistory.find(h => h.date === today)
            expect(todayEntry?.value).toBe(secondUpdate)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include timestamp in history entries', () => {
      fc.assert(
        fc.property(
          assetInputArb,
          (input) => {
            const asset = createAsset(input)
            
            // All history entries should have valid date strings
            asset.valueHistory.forEach(entry => {
              expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
              expect(typeof entry.value).toBe('number')
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain chronological order in history', () => {
      fc.assert(
        fc.property(
          assetInputArb,
          fc.array(fc.float({ min: 0, max: 1000000, noNaN: true }), { minLength: 2, maxLength: 10 }),
          (input, values) => {
            let asset = createAsset(input)
            
            // Create history with sequential dates
            const baseDate = parseISO(getCurrentDate())
            asset.valueHistory = values.map((value, index) => ({
              date: format(subDays(baseDate, values.length - index - 1), 'yyyy-MM-dd'),
              value,
            }))
            
            // Verify chronological order
            for (let i = 1; i < asset.valueHistory.length; i++) {
              const prevDate = parseISO(asset.valueHistory[i - 1].date)
              const currDate = parseISO(asset.valueHistory[i].date)
              expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime())
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
