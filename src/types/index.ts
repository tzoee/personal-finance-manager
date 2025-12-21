// Core Types
export type TransactionType = 'income' | 'expense' | 'transfer'
export type PaymentMethod = 'cash' | 'bank' | 'e-wallet'
export type Priority = 'low' | 'medium' | 'high'
export type WishlistStatus = 'planned' | 'saving' | 'bought'
export type InstallmentStatus = 'active' | 'paid_off'
export type AssetType = 'cash' | 'savings' | 'investment' | 'gold' | 'property' | 'other'
export type LiabilityType = 'debt' | 'loan' | 'other'
export type CategoryType = 'income' | 'expense' | 'asset' | 'liability'

// Transaction
export interface Transaction {
  id: string
  date: string // ISO date string
  type: TransactionType
  amount: number
  categoryId: string
  subcategoryId?: string
  note?: string
  paymentMethod?: PaymentMethod
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface TransactionInput {
  date: string
  type: TransactionType
  amount: number
  categoryId: string
  subcategoryId?: string
  note?: string
  paymentMethod?: PaymentMethod
  tags?: string[]
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  type?: TransactionType
  categoryId?: string
  subcategoryId?: string
  searchText?: string
}

// Category
export interface Category {
  id: string
  name: string
  type: CategoryType
  subcategories: Subcategory[]
  isDefault: boolean
  createdAt: string
}

export interface Subcategory {
  id: string
  name: string
  parentId?: string
}

export interface CategoryInput {
  name: string
  type: CategoryType
  parentId?: string // For subcategory
}

// Wishlist
export interface WishlistItem {
  id: string
  name: string
  targetPrice: number
  priority: Priority
  targetDate?: string
  currentSaved: number
  status: WishlistStatus
  note?: string
  createdAt: string
  updatedAt: string
}

export interface WishlistInput {
  name: string
  targetPrice: number
  priority: Priority
  targetDate?: string
  currentSaved?: number
  note?: string
}

// Installment
export interface Installment {
  id: string
  name: string
  totalAmount?: number
  totalTenor: number // Total months
  currentTenor?: number
  currentMonth: number // Current month position
  monthlyAmount: number
  startDate: string
  categoryId?: string
  subcategoryId?: string
  subcategory: string
  status: InstallmentStatus
  autoGenerateTransaction: boolean
  autoCreateTransaction?: boolean
  lastGeneratedMonth?: string // YYYY-MM format
  note?: string
  createdAt: string
  updatedAt: string
}

export interface InstallmentInput {
  name: string
  totalTenor: number
  monthlyAmount: number
  startDate: string
  subcategory: string
  autoGenerateTransaction?: boolean
}

// Monthly Need
export interface MonthlyNeed {
  id: string
  name: string
  budgetAmount: number
  dueDay?: number // 1-31
  categoryId?: string
  subcategoryId?: string
  subcategory?: string
  note?: string
  createdAt: string
  updatedAt?: string
}

export interface MonthlyNeedPayment {
  id: string
  needId: string
  yearMonth: string // YYYY-MM format
  actualAmount: number
  paidAt: string
  transactionId?: string
}

export interface MonthlyNeedInput {
  name: string
  budgetAmount: number
  dueDay?: number
  subcategory?: string
  note?: string
}

// Asset & Liability
export interface Asset {
  id: string
  name: string
  type: AssetType | LiabilityType
  isLiability: boolean
  initialValue: number
  currentValue: number
  valueHistory: AssetValueHistory[]
  note?: string
  createdAt: string
  updatedAt: string
}

export interface AssetValueHistory {
  date: string
  value: number
}

export interface AssetInput {
  name: string
  type: AssetType | LiabilityType
  isLiability: boolean
  initialValue: number
  currentValue: number
}

// Dashboard Types
export interface MonthlySummary {
  year: number
  month: number
  totalIncome: number
  totalExpense: number
  surplus: number
  surplusRate: number
  transactionCount: number
}

export interface CashflowData {
  month: string // YYYY-MM
  income: number
  expense: number
  surplus: number
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
}

export interface CategoryComparison {
  categoryId: string
  categoryName: string
  currentMonth: number
  previousMonth: number
  change: number
  changePercentage: number
}

export interface EmergencyFundStatus {
  monthlyLivingCost: number
  targetMultiplier: number
  targetAmount: number
  currentAmount: number
  progress: number // 0-100
}

export interface Insight {
  type: 'warning' | 'info' | 'success'
  message: string
}

export interface TrendData {
  month: string
  value: number
}

export interface NetWorthHistory {
  month: string
  assets: number
  liabilities: number
  netWorth: number
}

export interface BudgetComparison {
  needId: string
  name: string
  budget: number
  actual: number
  difference: number
  isOverBudget: boolean
}

// Settings
export interface AppSettings {
  currency: string
  monthlyLivingCost: number
  emergencyFundMultiplier: number
  darkMode: boolean
  schemaVersion: number
}

// Storage
export interface AppData {
  version: number
  settings: AppSettings
  transactions: Transaction[]
  categories: Category[]
  wishlist: WishlistItem[]
  installments: Installment[]
  monthlyNeeds: MonthlyNeed[]
  monthlyNeedPayments: MonthlyNeedPayment[]
  assets: Asset[]
  exportedAt: string
}

export interface StorageInfo {
  totalRecords: number
  lastBackup?: string
  storageUsed: number
}

// Validation
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
