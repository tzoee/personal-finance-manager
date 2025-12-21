/**
 * Seed Data Generator
 * Generates realistic sample data for 3+ months
 */

import { generateId } from '../utils/idGenerator'
import type {
  Transaction,
  Category,
  Subcategory,
  WishlistItem,
  Installment,
  MonthlyNeed,
  Asset,
} from '../types'

// Helper to generate date string
function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Helper to get random amount in range
function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) / 1000) * 1000
}

/**
 * Generate default categories with subcategories
 */
export function generateSeedCategories(): Category[] {
  const now = new Date().toISOString()
  
  const incomeSubcategories: Subcategory[] = [
    { id: generateId(), name: 'Gaji Pokok' },
    { id: generateId(), name: 'Bonus' },
    { id: generateId(), name: 'Freelance' },
    { id: generateId(), name: 'Investasi' },
  ]

  const expenseSubcategories: Record<string, Subcategory[]> = {
    'Kebutuhan Bulanan': [
      { id: generateId(), name: 'Listrik' },
      { id: generateId(), name: 'Air' },
      { id: generateId(), name: 'Internet' },
      { id: generateId(), name: 'Pulsa' },
    ],
    'Makanan': [
      { id: generateId(), name: 'Makan Harian' },
      { id: generateId(), name: 'Groceries' },
      { id: generateId(), name: 'Makan Luar' },
    ],
    'Transport': [
      { id: generateId(), name: 'Bensin' },
      { id: generateId(), name: 'Parkir' },
      { id: generateId(), name: 'Ojol' },
    ],
    'Cicilan': [
      { id: generateId(), name: 'Motor' },
      { id: generateId(), name: 'HP' },
      { id: generateId(), name: 'KPR' },
    ],
    'Hiburan': [
      { id: generateId(), name: 'Streaming' },
      { id: generateId(), name: 'Game' },
      { id: generateId(), name: 'Hangout' },
    ],
    'Kesehatan': [
      { id: generateId(), name: 'Obat' },
      { id: generateId(), name: 'Dokter' },
      { id: generateId(), name: 'Gym' },
    ],
  }

  const categories: Category[] = [
    // Income categories
    {
      id: generateId(),
      name: 'Pendapatan',
      type: 'income',
      subcategories: incomeSubcategories,
      isDefault: true,
      createdAt: now,
    },
    // Expense categories
    ...Object.entries(expenseSubcategories).map(([name, subs]) => ({
      id: generateId(),
      name,
      type: 'expense' as const,
      subcategories: subs,
      isDefault: true,
      createdAt: now,
    })),
    // Asset categories
    {
      id: generateId(),
      name: 'Tabungan',
      type: 'asset' as const,
      subcategories: [
        { id: generateId(), name: 'Bank' },
        { id: generateId(), name: 'E-Wallet' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Investasi',
      type: 'asset' as const,
      subcategories: [
        { id: generateId(), name: 'Saham' },
        { id: generateId(), name: 'Reksadana' },
        { id: generateId(), name: 'Emas' },
      ],
      isDefault: true,
      createdAt: now,
    },
  ]

  return categories
}


/**
 * Generate sample transactions for 3+ months
 */
export function generateSeedTransactions(categories: Category[]): Transaction[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  const transactions: Transaction[] = []
  const incomeCategory = categories.find(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  // Generate 3 months of data
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    let month = currentMonth - monthOffset
    let year = currentYear
    if (month <= 0) {
      month += 12
      year -= 1
    }

    // Monthly salary (income)
    if (incomeCategory) {
      const salarySubcat = incomeCategory.subcategories?.find(s => s.name === 'Gaji Pokok')
      transactions.push({
        id: generateId(),
        date: dateStr(year, month, 1),
        type: 'income',
        amount: randomAmount(8000000, 15000000),
        categoryId: incomeCategory.id,
        subcategoryId: salarySubcat?.id,
        note: 'Gaji bulanan',
        createdAt: new Date(year, month - 1, 1).toISOString(),
        updatedAt: new Date(year, month - 1, 1).toISOString(),
      })

      // Occasional bonus/freelance
      if (Math.random() > 0.6) {
        const bonusSubcat = incomeCategory.subcategories?.find(s => s.name === 'Bonus' || s.name === 'Freelance')
        transactions.push({
          id: generateId(),
          date: dateStr(year, month, randomItem([10, 15, 20, 25])),
          type: 'income',
          amount: randomAmount(500000, 3000000),
          categoryId: incomeCategory.id,
          subcategoryId: bonusSubcat?.id,
          note: 'Pendapatan tambahan',
          createdAt: new Date(year, month - 1, 15).toISOString(),
          updatedAt: new Date(year, month - 1, 15).toISOString(),
        })
      }
    }

    // Generate expenses for each category
    for (const category of expenseCategories) {
      const numTransactions = Math.floor(Math.random() * 5) + 2

      for (let i = 0; i < numTransactions; i++) {
        const day = Math.floor(Math.random() * 28) + 1
        const subcategory = category.subcategories?.length 
          ? randomItem(category.subcategories) 
          : undefined

        let amount: number
        switch (category.name) {
          case 'Kebutuhan Bulanan':
            amount = randomAmount(100000, 500000)
            break
          case 'Makanan':
            amount = randomAmount(30000, 200000)
            break
          case 'Transport':
            amount = randomAmount(20000, 150000)
            break
          case 'Cicilan':
            amount = randomAmount(500000, 2000000)
            break
          case 'Hiburan':
            amount = randomAmount(50000, 300000)
            break
          case 'Kesehatan':
            amount = randomAmount(50000, 500000)
            break
          default:
            amount = randomAmount(50000, 300000)
        }

        transactions.push({
          id: generateId(),
          date: dateStr(year, month, day),
          type: 'expense',
          amount,
          categoryId: category.id,
          subcategoryId: subcategory?.id,
          note: `${category.name} - ${subcategory?.name || 'Umum'}`,
          createdAt: new Date(year, month - 1, day).toISOString(),
          updatedAt: new Date(year, month - 1, day).toISOString(),
        })
      }
    }
  }

  // Sort by date descending
  return transactions.sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Generate sample wishlist items
 */
export function generateSeedWishlist(): WishlistItem[] {
  const now = new Date().toISOString()
  
  return [
    {
      id: generateId(),
      name: 'MacBook Pro M3',
      targetPrice: 25000000,
      priority: 'high',
      currentSaved: 8000000,
      status: 'saving',
      targetDate: '2025-06-01',
      note: 'Untuk kerja dan coding',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'iPhone 15 Pro',
      targetPrice: 18000000,
      priority: 'medium',
      currentSaved: 3000000,
      status: 'saving',
      targetDate: '2025-08-01',
      note: 'Upgrade dari iPhone lama',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Mechanical Keyboard',
      targetPrice: 2500000,
      priority: 'low',
      currentSaved: 500000,
      status: 'planned',
      note: 'Keychron Q1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Monitor 4K 27"',
      targetPrice: 5000000,
      priority: 'medium',
      currentSaved: 2000000,
      status: 'saving',
      targetDate: '2025-04-01',
      note: 'Untuk WFH setup',
      createdAt: now,
      updatedAt: now,
    },
  ]
}


/**
 * Generate sample installments
 */
export function generateSeedInstallments(categories: Category[]): Installment[] {
  const now = new Date()
  const cicilanCategory = categories.find(c => c.name === 'Cicilan')
  
  return [
    {
      id: generateId(),
      name: 'Cicilan Motor',
      totalAmount: 18000000,
      monthlyAmount: 750000,
      totalTenor: 24,
      currentTenor: 8,
      currentMonth: 8,
      startDate: '2024-05-01',
      categoryId: cicilanCategory?.id,
      subcategoryId: cicilanCategory?.subcategories?.find(s => s.name === 'Motor')?.id,
      subcategory: 'Motor',
      status: 'active',
      autoGenerateTransaction: true,
      autoCreateTransaction: true,
      payments: [],
      note: 'Honda Beat 2024',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: 'Cicilan HP',
      totalAmount: 12000000,
      monthlyAmount: 1000000,
      totalTenor: 12,
      currentTenor: 5,
      currentMonth: 5,
      startDate: '2024-08-01',
      categoryId: cicilanCategory?.id,
      subcategoryId: cicilanCategory?.subcategories?.find(s => s.name === 'HP')?.id,
      subcategory: 'HP/Gadget',
      status: 'active',
      autoGenerateTransaction: false,
      autoCreateTransaction: false,
      payments: [],
      note: 'Samsung Galaxy S24',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ]
}

/**
 * Generate sample monthly needs
 */
export function generateSeedMonthlyNeeds(categories: Category[]): MonthlyNeed[] {
  const now = new Date().toISOString()
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const kebutuhanCategory = categories.find(c => c.name === 'Kebutuhan Bulanan')
  
  return [
    {
      id: generateId(),
      name: 'Listrik',
      budgetAmount: 350000,
      categoryId: kebutuhanCategory?.id,
      subcategoryId: kebutuhanCategory?.subcategories?.find(s => s.name === 'Listrik')?.id,
      dueDay: 20,
      recurrencePeriod: 'forever',
      startMonth: currentMonth,
      autoGenerateTransaction: false,
      note: 'Token listrik bulanan',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Air PDAM',
      budgetAmount: 150000,
      categoryId: kebutuhanCategory?.id,
      subcategoryId: kebutuhanCategory?.subcategories?.find(s => s.name === 'Air')?.id,
      dueDay: 15,
      recurrencePeriod: 'forever',
      startMonth: currentMonth,
      autoGenerateTransaction: false,
      note: 'Tagihan air',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Internet',
      budgetAmount: 450000,
      categoryId: kebutuhanCategory?.id,
      subcategoryId: kebutuhanCategory?.subcategories?.find(s => s.name === 'Internet')?.id,
      dueDay: 10,
      recurrencePeriod: 'forever',
      startMonth: currentMonth,
      autoGenerateTransaction: false,
      note: 'IndiHome 50Mbps',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Pulsa & Paket Data',
      budgetAmount: 100000,
      categoryId: kebutuhanCategory?.id,
      subcategoryId: kebutuhanCategory?.subcategories?.find(s => s.name === 'Pulsa')?.id,
      dueDay: 1,
      recurrencePeriod: 'forever',
      startMonth: currentMonth,
      autoGenerateTransaction: false,
      note: 'Paket data bulanan',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

/**
 * Generate sample assets
 */
export function generateSeedAssets(): Asset[] {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  
  return [
    {
      id: generateId(),
      name: 'Tabungan BCA',
      type: 'savings',
      isLiability: false,
      initialValue: 15000000,
      currentValue: 22000000,
      valueHistory: [
        { date: threeMonthsAgo.toISOString().split('T')[0], value: 15000000 },
        { date: twoMonthsAgo.toISOString().split('T')[0], value: 18000000 },
        { date: oneMonthAgo.toISOString().split('T')[0], value: 20000000 },
        { date: now.toISOString().split('T')[0], value: 22000000 },
      ],
      note: 'Rekening utama',
      createdAt: threeMonthsAgo.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: 'Dana Darurat',
      type: 'savings',
      isLiability: false,
      initialValue: 10000000,
      currentValue: 15000000,
      valueHistory: [
        { date: threeMonthsAgo.toISOString().split('T')[0], value: 10000000 },
        { date: twoMonthsAgo.toISOString().split('T')[0], value: 12000000 },
        { date: oneMonthAgo.toISOString().split('T')[0], value: 14000000 },
        { date: now.toISOString().split('T')[0], value: 15000000 },
      ],
      note: 'Target 6x biaya hidup',
      createdAt: threeMonthsAgo.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: 'Reksadana Pasar Uang',
      type: 'investment',
      isLiability: false,
      initialValue: 5000000,
      currentValue: 5500000,
      valueHistory: [
        { date: threeMonthsAgo.toISOString().split('T')[0], value: 5000000 },
        { date: twoMonthsAgo.toISOString().split('T')[0], value: 5150000 },
        { date: oneMonthAgo.toISOString().split('T')[0], value: 5300000 },
        { date: now.toISOString().split('T')[0], value: 5500000 },
      ],
      note: 'Bibit - RDPU',
      createdAt: threeMonthsAgo.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: 'Emas Antam',
      type: 'gold',
      isLiability: false,
      initialValue: 3000000,
      currentValue: 3200000,
      valueHistory: [
        { date: threeMonthsAgo.toISOString().split('T')[0], value: 3000000 },
        { date: now.toISOString().split('T')[0], value: 3200000 },
      ],
      note: '3 gram',
      createdAt: threeMonthsAgo.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: 'GoPay',
      type: 'cash',
      isLiability: false,
      initialValue: 500000,
      currentValue: 750000,
      valueHistory: [
        { date: now.toISOString().split('T')[0], value: 750000 },
      ],
      note: 'E-wallet',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ]
}

/**
 * Generate all seed data
 */
export function generateAllSeedData() {
  const categories = generateSeedCategories()
  const transactions = generateSeedTransactions(categories)
  const wishlist = generateSeedWishlist()
  const installments = generateSeedInstallments(categories)
  const monthlyNeeds = generateSeedMonthlyNeeds(categories)
  const assets = generateSeedAssets()

  return {
    categories,
    transactions,
    wishlist,
    installments,
    monthlyNeeds,
    assets,
  }
}

/**
 * Apply seed data to localStorage
 */
export function applySeedData(): void {
  const data = generateAllSeedData()
  
  localStorage.setItem('pfm_categories', JSON.stringify(data.categories))
  localStorage.setItem('pfm_transactions', JSON.stringify(data.transactions))
  localStorage.setItem('pfm_wishlist', JSON.stringify(data.wishlist))
  localStorage.setItem('pfm_installments', JSON.stringify(data.installments))
  localStorage.setItem('pfm_monthly_needs', JSON.stringify(data.monthlyNeeds))
  localStorage.setItem('pfm_assets', JSON.stringify(data.assets))
}

/**
 * Check if seed data has been applied
 */
export function hasSeedData(): boolean {
  return localStorage.getItem('pfm_categories') !== null
}
