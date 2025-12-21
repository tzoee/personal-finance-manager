import type { TransactionInput, CategoryInput, WishlistInput, InstallmentInput, MonthlyNeedInput, AssetInput, ValidationResult, ValidationError } from '../types'
import { isValidDate } from './dateUtils'

/**
 * Validate transaction input
 */
export function validateTransaction(input: Partial<TransactionInput>): ValidationResult {
  const errors: ValidationError[] = []

  if (!input.date) {
    errors.push({ field: 'date', message: 'Tanggal wajib diisi' })
  } else if (!isValidDate(input.date)) {
    errors.push({ field: 'date', message: 'Format tanggal tidak valid' })
  }

  if (!input.type) {
    errors.push({ field: 'type', message: 'Jenis transaksi wajib dipilih' })
  }

  if (input.amount === undefined || input.amount === null) {
    errors.push({ field: 'amount', message: 'Jumlah wajib diisi' })
  } else if (input.amount <= 0) {
    errors.push({ field: 'amount', message: 'Jumlah harus lebih dari 0' })
  }

  if (!input.categoryId) {
    errors.push({ field: 'categoryId', message: 'Kategori wajib dipilih' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate category input
 */
export function validateCategory(input: Partial<CategoryInput>, existingNames: string[] = []): ValidationResult {
  const errors: ValidationError[] = []

  if (!input.name || input.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nama kategori wajib diisi' })
  } else if (existingNames.includes(input.name.trim().toLowerCase())) {
    errors.push({ field: 'name', message: 'Nama kategori sudah ada' })
  }

  if (!input.type) {
    errors.push({ field: 'type', message: 'Tipe kategori wajib dipilih' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate wishlist item input
 */
export function validateWishlistItem(input: Partial<WishlistInput>): ValidationResult {
  const errors: ValidationError[] = []

  if (!input.name || input.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nama item wajib diisi' })
  }

  if (input.targetPrice === undefined || input.targetPrice === null) {
    errors.push({ field: 'targetPrice', message: 'Target harga wajib diisi' })
  } else if (input.targetPrice <= 0) {
    errors.push({ field: 'targetPrice', message: 'Target harga harus lebih dari 0' })
  }

  if (!input.priority) {
    errors.push({ field: 'priority', message: 'Prioritas wajib dipilih' })
  }

  if (input.targetDate && !isValidDate(input.targetDate)) {
    errors.push({ field: 'targetDate', message: 'Format tanggal tidak valid' })
  }

  if (input.currentSaved !== undefined && input.currentSaved < 0) {
    errors.push({ field: 'currentSaved', message: 'Tabungan tidak boleh negatif' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate installment input
 */
export function validateInstallment(input: Partial<InstallmentInput>): ValidationResult {
  const errors: ValidationError[] = []

  if (!input.name || input.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nama cicilan wajib diisi' })
  }

  if (input.totalTenor === undefined || input.totalTenor === null) {
    errors.push({ field: 'totalTenor', message: 'Total tenor wajib diisi' })
  } else if (input.totalTenor <= 0) {
    errors.push({ field: 'totalTenor', message: 'Total tenor harus lebih dari 0' })
  }

  if (input.monthlyAmount === undefined || input.monthlyAmount === null) {
    errors.push({ field: 'monthlyAmount', message: 'Jumlah per bulan wajib diisi' })
  } else if (input.monthlyAmount <= 0) {
    errors.push({ field: 'monthlyAmount', message: 'Jumlah per bulan harus lebih dari 0' })
  }

  if (!input.startDate) {
    errors.push({ field: 'startDate', message: 'Tanggal mulai wajib diisi' })
  } else if (!isValidDate(input.startDate)) {
    errors.push({ field: 'startDate', message: 'Format tanggal tidak valid' })
  }

  if (!input.subcategory || input.subcategory.trim() === '') {
    errors.push({ field: 'subcategory', message: 'Subkategori wajib diisi' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate monthly need input
 */
export function validateMonthlyNeed(input: Partial<MonthlyNeedInput>): ValidationResult {
  const errors: ValidationError[] = []

  if (!input.name || input.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nama kebutuhan wajib diisi' })
  }

  if (input.budgetAmount === undefined || input.budgetAmount === null) {
    errors.push({ field: 'budgetAmount', message: 'Budget wajib diisi' })
  } else if (input.budgetAmount <= 0) {
    errors.push({ field: 'budgetAmount', message: 'Budget harus lebih dari 0' })
  }

  if (input.dueDay !== undefined && (input.dueDay < 1 || input.dueDay > 31)) {
    errors.push({ field: 'dueDay', message: 'Tanggal jatuh tempo harus antara 1-31' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate asset input
 */
export function validateAsset(input: Partial<AssetInput>): ValidationResult {
  const errors: ValidationError[] = []

  if (!input.name || input.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nama aset wajib diisi' })
  }

  if (!input.type) {
    errors.push({ field: 'type', message: 'Tipe aset wajib dipilih' })
  }

  if (input.initialValue === undefined || input.initialValue === null) {
    errors.push({ field: 'initialValue', message: 'Nilai awal wajib diisi' })
  } else if (input.initialValue < 0) {
    errors.push({ field: 'initialValue', message: 'Nilai awal tidak boleh negatif' })
  }

  if (input.currentValue === undefined || input.currentValue === null) {
    errors.push({ field: 'currentValue', message: 'Nilai saat ini wajib diisi' })
  } else if (input.currentValue < 0) {
    errors.push({ field: 'currentValue', message: 'Nilai saat ini tidak boleh negatif' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message
}
