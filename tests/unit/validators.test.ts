import { describe, it, expect } from 'vitest'
import {
  validateTransaction,
  validateCategory,
  validateWishlistItem,
  validateInstallment,
  validateMonthlyNeed,
  validateAsset,
} from '../../src/utils/validators'

describe('validateTransaction', () => {
  it('should pass for valid transaction input', () => {
    const input = {
      date: '2024-12-21',
      type: 'expense' as const,
      amount: 100000,
      categoryId: 'cat-123',
    }
    const result = validateTransaction(input)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail when date is missing', () => {
    const input = {
      type: 'expense' as const,
      amount: 100000,
      categoryId: 'cat-123',
    }
    const result = validateTransaction(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'date')).toBe(true)
  })

  it('should fail when amount is zero', () => {
    const input = {
      date: '2024-12-21',
      type: 'expense' as const,
      amount: 0,
      categoryId: 'cat-123',
    }
    const result = validateTransaction(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'amount')).toBe(true)
  })

  it('should fail when amount is negative', () => {
    const input = {
      date: '2024-12-21',
      type: 'expense' as const,
      amount: -100,
      categoryId: 'cat-123',
    }
    const result = validateTransaction(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'amount')).toBe(true)
  })

  it('should fail when categoryId is missing', () => {
    const input = {
      date: '2024-12-21',
      type: 'expense' as const,
      amount: 100000,
    }
    const result = validateTransaction(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'categoryId')).toBe(true)
  })
})

describe('validateCategory', () => {
  it('should pass for valid category input', () => {
    const input = {
      name: 'New Category',
      type: 'expense' as const,
    }
    const result = validateCategory(input)
    expect(result.isValid).toBe(true)
  })

  it('should fail when name is empty', () => {
    const input = {
      name: '',
      type: 'expense' as const,
    }
    const result = validateCategory(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'name')).toBe(true)
  })

  it('should fail when name already exists', () => {
    const input = {
      name: 'Existing',
      type: 'expense' as const,
    }
    const result = validateCategory(input, ['existing'])
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.message.includes('sudah ada'))).toBe(true)
  })
})

describe('validateWishlistItem', () => {
  it('should pass for valid wishlist input', () => {
    const input = {
      name: 'iPhone',
      targetPrice: 15000000,
      priority: 'high' as const,
    }
    const result = validateWishlistItem(input)
    expect(result.isValid).toBe(true)
  })

  it('should fail when targetPrice is zero', () => {
    const input = {
      name: 'iPhone',
      targetPrice: 0,
      priority: 'high' as const,
    }
    const result = validateWishlistItem(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'targetPrice')).toBe(true)
  })
})

describe('validateInstallment', () => {
  it('should pass for valid installment input', () => {
    const input = {
      name: 'Motor',
      totalTenor: 24,
      monthlyAmount: 1500000,
      startDate: '2024-01-01',
      subcategory: 'Kendaraan',
    }
    const result = validateInstallment(input)
    expect(result.isValid).toBe(true)
  })

  it('should fail when totalTenor is zero', () => {
    const input = {
      name: 'Motor',
      totalTenor: 0,
      monthlyAmount: 1500000,
      startDate: '2024-01-01',
      subcategory: 'Kendaraan',
    }
    const result = validateInstallment(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'totalTenor')).toBe(true)
  })
})

describe('validateMonthlyNeed', () => {
  it('should pass for valid monthly need input', () => {
    const input = {
      name: 'Listrik',
      budgetAmount: 500000,
      dueDay: 20,
    }
    const result = validateMonthlyNeed(input)
    expect(result.isValid).toBe(true)
  })

  it('should fail when dueDay is out of range', () => {
    const input = {
      name: 'Listrik',
      budgetAmount: 500000,
      dueDay: 32,
    }
    const result = validateMonthlyNeed(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'dueDay')).toBe(true)
  })
})

describe('validateAsset', () => {
  it('should pass for valid asset input', () => {
    const input = {
      name: 'Tabungan BCA',
      type: 'savings' as const,
      isLiability: false,
      initialValue: 10000000,
      currentValue: 12000000,
    }
    const result = validateAsset(input)
    expect(result.isValid).toBe(true)
  })

  it('should fail when currentValue is negative', () => {
    const input = {
      name: 'Tabungan BCA',
      type: 'savings' as const,
      isLiability: false,
      initialValue: 10000000,
      currentValue: -100,
    }
    const result = validateAsset(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'currentValue')).toBe(true)
  })
})
