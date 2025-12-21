import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  parseFormattedNumber,
  formatPercentage,
} from '../../src/utils/formatters'

describe('formatCurrency', () => {
  it('should format number as IDR currency', () => {
    const result = formatCurrency(1500000)
    expect(result).toContain('1.500.000')
    expect(result).toContain('Rp')
  })

  it('should handle zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('should handle negative numbers', () => {
    const result = formatCurrency(-500000)
    expect(result).toContain('500.000')
  })
})

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1500000)).toBe('1.500.000')
  })

  it('should handle small numbers', () => {
    expect(formatNumber(100)).toBe('100')
  })
})

describe('parseFormattedNumber', () => {
  it('should parse formatted number string', () => {
    expect(parseFormattedNumber('1.500.000')).toBe(1500000)
  })

  it('should handle currency prefix', () => {
    expect(parseFormattedNumber('Rp 1.500.000')).toBe(1500000)
  })

  it('should return 0 for invalid input', () => {
    expect(parseFormattedNumber('abc')).toBe(0)
  })
})

describe('formatPercentage', () => {
  it('should format percentage with default decimals', () => {
    expect(formatPercentage(75.5)).toBe('75.5%')
  })

  it('should format percentage with custom decimals', () => {
    expect(formatPercentage(75.567, 2)).toBe('75.57%')
  })

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })
})
