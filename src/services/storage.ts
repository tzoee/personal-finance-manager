import Dexie, { type Table } from 'dexie'
import type {
  Transaction,
  Category,
  WishlistItem,
  Installment,
  MonthlyNeed,
  MonthlyNeedPayment,
  Asset,
  AppSettings,
  AppData,
} from '../types'
import { CURRENT_SCHEMA_VERSION, DEFAULT_SETTINGS, getDefaultCategories } from '../constants/defaults'

/**
 * Personal Finance Manager Database using Dexie.js (IndexedDB wrapper)
 */
class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction, string>
  categories!: Table<Category, string>
  wishlist!: Table<WishlistItem, string>
  installments!: Table<Installment, string>
  monthlyNeeds!: Table<MonthlyNeed, string>
  monthlyNeedPayments!: Table<MonthlyNeedPayment, string>
  assets!: Table<Asset, string>
  settings!: Table<AppSettings & { id: string }, string>

  constructor() {
    super('PersonalFinanceManager')

    // Schema version 1
    this.version(1).stores({
      transactions: 'id, date, type, categoryId, subcategoryId, createdAt',
      categories: 'id, name, type, isDefault, createdAt',
      wishlist: 'id, name, priority, status, createdAt',
      installments: 'id, name, status, startDate, createdAt',
      monthlyNeeds: 'id, name, createdAt',
      monthlyNeedPayments: 'id, needId, yearMonth, paidAt',
      assets: 'id, name, type, isLiability, createdAt',
      settings: 'id',
    })
  }
}

// Singleton database instance
let db: FinanceDatabase | null = null

/**
 * Get or create database instance
 */
export function getDatabase(): FinanceDatabase {
  if (!db) {
    db = new FinanceDatabase()
  }
  return db
}

/**
 * Initialize database with default data if empty
 */
export async function initializeDatabase(): Promise<void> {
  const database = getDatabase()

  // Check if categories exist, if not initialize with defaults
  const categoryCount = await database.categories.count()
  if (categoryCount === 0) {
    const defaultCategories = getDefaultCategories()
    await database.categories.bulkAdd(defaultCategories)
  }

  // Check if settings exist, if not initialize with defaults
  const settingsCount = await database.settings.count()
  if (settingsCount === 0) {
    await database.settings.add({ id: 'app_settings', ...DEFAULT_SETTINGS })
  }
}

/**
 * Storage service for CRUD operations
 */
export const storageService = {
  // ============ TRANSACTIONS ============
  async getAllTransactions(): Promise<Transaction[]> {
    const db = getDatabase()
    return db.transactions.orderBy('date').reverse().toArray()
  },

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const db = getDatabase()
    return db.transactions.get(id)
  },

  async addTransaction(transaction: Transaction): Promise<string> {
    const db = getDatabase()
    return db.transactions.add(transaction)
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const db = getDatabase()
    await db.transactions.update(id, updates)
  },

  async deleteTransaction(id: string): Promise<void> {
    const db = getDatabase()
    await db.transactions.delete(id)
  },

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const db = getDatabase()
    return db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray()
  },

  async getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
    const db = getDatabase()
    return db.transactions.where('categoryId').equals(categoryId).toArray()
  },

  // ============ CATEGORIES ============
  async getAllCategories(): Promise<Category[]> {
    const db = getDatabase()
    return db.categories.toArray()
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    const db = getDatabase()
    return db.categories.get(id)
  },

  async addCategory(category: Category): Promise<string> {
    const db = getDatabase()
    return db.categories.add(category)
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const db = getDatabase()
    await db.categories.update(id, updates)
  },

  async deleteCategory(id: string): Promise<void> {
    const db = getDatabase()
    await db.categories.delete(id)
  },

  // ============ WISHLIST ============
  async getAllWishlistItems(): Promise<WishlistItem[]> {
    const db = getDatabase()
    return db.wishlist.toArray()
  },

  async getWishlistItemById(id: string): Promise<WishlistItem | undefined> {
    const db = getDatabase()
    return db.wishlist.get(id)
  },

  async addWishlistItem(item: WishlistItem): Promise<string> {
    const db = getDatabase()
    return db.wishlist.add(item)
  },

  async updateWishlistItem(id: string, updates: Partial<WishlistItem>): Promise<void> {
    const db = getDatabase()
    await db.wishlist.update(id, updates)
  },

  async deleteWishlistItem(id: string): Promise<void> {
    const db = getDatabase()
    await db.wishlist.delete(id)
  },

  // ============ INSTALLMENTS ============
  async getAllInstallments(): Promise<Installment[]> {
    const db = getDatabase()
    return db.installments.toArray()
  },

  async getInstallmentById(id: string): Promise<Installment | undefined> {
    const db = getDatabase()
    return db.installments.get(id)
  },

  async addInstallment(installment: Installment): Promise<string> {
    const db = getDatabase()
    return db.installments.add(installment)
  },

  async updateInstallment(id: string, updates: Partial<Installment>): Promise<void> {
    const db = getDatabase()
    await db.installments.update(id, updates)
  },

  async deleteInstallment(id: string): Promise<void> {
    const db = getDatabase()
    await db.installments.delete(id)
  },

  // ============ MONTHLY NEEDS ============
  async getAllMonthlyNeeds(): Promise<MonthlyNeed[]> {
    const db = getDatabase()
    return db.monthlyNeeds.toArray()
  },

  async getMonthlyNeedById(id: string): Promise<MonthlyNeed | undefined> {
    const db = getDatabase()
    return db.monthlyNeeds.get(id)
  },

  async addMonthlyNeed(need: MonthlyNeed): Promise<string> {
    const db = getDatabase()
    return db.monthlyNeeds.add(need)
  },

  async updateMonthlyNeed(id: string, updates: Partial<MonthlyNeed>): Promise<void> {
    const db = getDatabase()
    await db.monthlyNeeds.update(id, updates)
  },

  async deleteMonthlyNeed(id: string): Promise<void> {
    const db = getDatabase()
    await db.monthlyNeeds.delete(id)
  },

  // ============ MONTHLY NEED PAYMENTS ============
  async getAllMonthlyNeedPayments(): Promise<MonthlyNeedPayment[]> {
    const db = getDatabase()
    return db.monthlyNeedPayments.toArray()
  },

  async getPaymentsByNeedId(needId: string): Promise<MonthlyNeedPayment[]> {
    const db = getDatabase()
    return db.monthlyNeedPayments.where('needId').equals(needId).toArray()
  },

  async getPaymentByNeedAndMonth(needId: string, yearMonth: string): Promise<MonthlyNeedPayment | undefined> {
    const db = getDatabase()
    return db.monthlyNeedPayments
      .where(['needId', 'yearMonth'])
      .equals([needId, yearMonth])
      .first()
  },

  async addMonthlyNeedPayment(payment: MonthlyNeedPayment): Promise<string> {
    const db = getDatabase()
    return db.monthlyNeedPayments.add(payment)
  },

  async updateMonthlyNeedPayment(id: string, updates: Partial<MonthlyNeedPayment>): Promise<void> {
    const db = getDatabase()
    await db.monthlyNeedPayments.update(id, updates)
  },

  async deleteMonthlyNeedPayment(id: string): Promise<void> {
    const db = getDatabase()
    await db.monthlyNeedPayments.delete(id)
  },

  async deletePaymentsByNeedId(needId: string): Promise<void> {
    const db = getDatabase()
    await db.monthlyNeedPayments.where('needId').equals(needId).delete()
  },

  // ============ ASSETS ============
  async getAllAssets(): Promise<Asset[]> {
    const db = getDatabase()
    return db.assets.toArray()
  },

  async getAssetById(id: string): Promise<Asset | undefined> {
    const db = getDatabase()
    return db.assets.get(id)
  },

  async addAsset(asset: Asset): Promise<string> {
    const db = getDatabase()
    return db.assets.add(asset)
  },

  async updateAsset(id: string, updates: Partial<Asset>): Promise<void> {
    const db = getDatabase()
    await db.assets.update(id, updates)
  },

  async deleteAsset(id: string): Promise<void> {
    const db = getDatabase()
    await db.assets.delete(id)
  },

  // ============ SETTINGS ============
  async getSettings(): Promise<AppSettings> {
    const db = getDatabase()
    const settings = await db.settings.get('app_settings')
    if (settings) {
      const { id: _id, ...rest } = settings
      return rest
    }
    return DEFAULT_SETTINGS
  },

  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    const db = getDatabase()
    await db.settings.update('app_settings', updates)
  },

  // ============ BULK OPERATIONS ============
  async clearAllData(): Promise<void> {
    const db = getDatabase()
    await Promise.all([
      db.transactions.clear(),
      db.categories.clear(),
      db.wishlist.clear(),
      db.installments.clear(),
      db.monthlyNeeds.clear(),
      db.monthlyNeedPayments.clear(),
      db.assets.clear(),
      db.settings.clear(),
    ])
  },

  async bulkAddTransactions(transactions: Transaction[]): Promise<void> {
    const db = getDatabase()
    await db.transactions.bulkAdd(transactions)
  },

  async bulkAddCategories(categories: Category[]): Promise<void> {
    const db = getDatabase()
    await db.categories.bulkAdd(categories)
  },

  async bulkAddWishlistItems(items: WishlistItem[]): Promise<void> {
    const db = getDatabase()
    await db.wishlist.bulkAdd(items)
  },

  async bulkAddInstallments(installments: Installment[]): Promise<void> {
    const db = getDatabase()
    await db.installments.bulkAdd(installments)
  },

  async bulkAddMonthlyNeeds(needs: MonthlyNeed[]): Promise<void> {
    const db = getDatabase()
    await db.monthlyNeeds.bulkAdd(needs)
  },

  async bulkAddMonthlyNeedPayments(payments: MonthlyNeedPayment[]): Promise<void> {
    const db = getDatabase()
    await db.monthlyNeedPayments.bulkAdd(payments)
  },

  async bulkAddAssets(assets: Asset[]): Promise<void> {
    const db = getDatabase()
    await db.assets.bulkAdd(assets)
  },

  // ============ EXPORT/IMPORT ============
  async exportAllData(): Promise<AppData> {
    const db = getDatabase()
    const [
      transactions,
      categories,
      wishlist,
      installments,
      monthlyNeeds,
      monthlyNeedPayments,
      assets,
      settings,
    ] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.wishlist.toArray(),
      db.installments.toArray(),
      db.monthlyNeeds.toArray(),
      db.monthlyNeedPayments.toArray(),
      db.assets.toArray(),
      this.getSettings(),
    ])

    return {
      version: CURRENT_SCHEMA_VERSION,
      settings,
      transactions,
      categories,
      wishlist,
      installments,
      monthlyNeeds,
      monthlyNeedPayments,
      assets,
      exportedAt: new Date().toISOString(),
    }
  },

  async importData(data: AppData, mode: 'merge' | 'replace'): Promise<void> {
    const db = getDatabase()

    if (mode === 'replace') {
      await this.clearAllData()
    }

    // Import in order to handle dependencies
    if (data.settings) {
      await db.settings.put({ id: 'app_settings', ...data.settings })
    }

    if (data.categories?.length) {
      if (mode === 'replace') {
        await db.categories.bulkAdd(data.categories)
      } else {
        // Merge: only add categories that don't exist
        for (const category of data.categories) {
          const existing = await db.categories.get(category.id)
          if (!existing) {
            await db.categories.add(category)
          }
        }
      }
    }

    if (data.transactions?.length) {
      if (mode === 'replace') {
        await db.transactions.bulkAdd(data.transactions)
      } else {
        for (const tx of data.transactions) {
          const existing = await db.transactions.get(tx.id)
          if (!existing) {
            await db.transactions.add(tx)
          }
        }
      }
    }

    if (data.wishlist?.length) {
      if (mode === 'replace') {
        await db.wishlist.bulkAdd(data.wishlist)
      } else {
        for (const item of data.wishlist) {
          const existing = await db.wishlist.get(item.id)
          if (!existing) {
            await db.wishlist.add(item)
          }
        }
      }
    }

    if (data.installments?.length) {
      if (mode === 'replace') {
        await db.installments.bulkAdd(data.installments)
      } else {
        for (const inst of data.installments) {
          const existing = await db.installments.get(inst.id)
          if (!existing) {
            await db.installments.add(inst)
          }
        }
      }
    }

    if (data.monthlyNeeds?.length) {
      if (mode === 'replace') {
        await db.monthlyNeeds.bulkAdd(data.monthlyNeeds)
      } else {
        for (const need of data.monthlyNeeds) {
          const existing = await db.monthlyNeeds.get(need.id)
          if (!existing) {
            await db.monthlyNeeds.add(need)
          }
        }
      }
    }

    if (data.monthlyNeedPayments?.length) {
      if (mode === 'replace') {
        await db.monthlyNeedPayments.bulkAdd(data.monthlyNeedPayments)
      } else {
        for (const payment of data.monthlyNeedPayments) {
          const existing = await db.monthlyNeedPayments.get(payment.id)
          if (!existing) {
            await db.monthlyNeedPayments.add(payment)
          }
        }
      }
    }

    if (data.assets?.length) {
      if (mode === 'replace') {
        await db.assets.bulkAdd(data.assets)
      } else {
        for (const asset of data.assets) {
          const existing = await db.assets.get(asset.id)
          if (!existing) {
            await db.assets.add(asset)
          }
        }
      }
    }
  },

  // ============ STORAGE INFO ============
  async getStorageInfo(): Promise<{ totalRecords: number; tables: Record<string, number> }> {
    const db = getDatabase()
    const [
      transactionCount,
      categoryCount,
      wishlistCount,
      installmentCount,
      monthlyNeedCount,
      paymentCount,
      assetCount,
    ] = await Promise.all([
      db.transactions.count(),
      db.categories.count(),
      db.wishlist.count(),
      db.installments.count(),
      db.monthlyNeeds.count(),
      db.monthlyNeedPayments.count(),
      db.assets.count(),
    ])

    const tables = {
      transactions: transactionCount,
      categories: categoryCount,
      wishlist: wishlistCount,
      installments: installmentCount,
      monthlyNeeds: monthlyNeedCount,
      monthlyNeedPayments: paymentCount,
      assets: assetCount,
    }

    const totalRecords = Object.values(tables).reduce((sum, count) => sum + count, 0)

    return { totalRecords, tables }
  },
}

export default storageService
