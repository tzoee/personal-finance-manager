import type { Category, AppSettings } from '../types'
import { generateId } from '../utils/idGenerator'

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'IDR',
  monthlyLivingCost: 5000000,
  emergencyFundMultiplier: 6,
  darkMode: false,
  schemaVersion: 1,
}

/**
 * Current schema version for data migration
 */
export const CURRENT_SCHEMA_VERSION = 1

/**
 * Default categories
 */
export function getDefaultCategories(): Category[] {
  const now = new Date().toISOString()

  return [
    // Income categories
    {
      id: generateId(),
      name: 'Gaji',
      type: 'income',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Bonus',
      type: 'income',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Freelance',
      type: 'income',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Investasi',
      type: 'income',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Lainnya',
      type: 'income',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },

    // Expense categories
    {
      id: generateId(),
      name: 'Kebutuhan Bulanan',
      type: 'expense',
      subcategories: [
        { id: generateId(), name: 'Listrik', parentId: '' },
        { id: generateId(), name: 'Air', parentId: '' },
        { id: generateId(), name: 'Internet', parentId: '' },
        { id: generateId(), name: 'Pulsa', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Cicilan',
      type: 'expense',
      subcategories: [
        { id: generateId(), name: 'Kendaraan', parentId: '' },
        { id: generateId(), name: 'Gadget', parentId: '' },
        { id: generateId(), name: 'Rumah', parentId: '' },
        { id: generateId(), name: 'Pendidikan', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Transportasi',
      type: 'expense',
      subcategories: [
        { id: generateId(), name: 'Bensin', parentId: '' },
        { id: generateId(), name: 'Parkir', parentId: '' },
        { id: generateId(), name: 'Ojol', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Makan',
      type: 'expense',
      subcategories: [
        { id: generateId(), name: 'Makan Siang', parentId: '' },
        { id: generateId(), name: 'Makan Malam', parentId: '' },
        { id: generateId(), name: 'Snack', parentId: '' },
        { id: generateId(), name: 'Kopi', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Hiburan',
      type: 'expense',
      subcategories: [
        { id: generateId(), name: 'Streaming', parentId: '' },
        { id: generateId(), name: 'Game', parentId: '' },
        { id: generateId(), name: 'Nonton', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Belanja',
      type: 'expense',
      subcategories: [
        { id: generateId(), name: 'Pakaian', parentId: '' },
        { id: generateId(), name: 'Elektronik', parentId: '' },
        { id: generateId(), name: 'Rumah Tangga', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Kesehatan',
      type: 'expense',
      subcategories: [
        { id: generateId(), name: 'Obat', parentId: '' },
        { id: generateId(), name: 'Dokter', parentId: '' },
        { id: generateId(), name: 'Gym', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Lainnya',
      type: 'expense',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },

    // Asset categories
    {
      id: generateId(),
      name: 'Tabungan',
      type: 'asset',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Investasi',
      type: 'asset',
      subcategories: [
        { id: generateId(), name: 'Saham', parentId: '' },
        { id: generateId(), name: 'Reksadana', parentId: '' },
        { id: generateId(), name: 'Obligasi', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Emas',
      type: 'asset',
      subcategories: [],
      isDefault: true,
      createdAt: now,
    },

    // Liability categories
    {
      id: generateId(),
      name: 'Utang',
      type: 'liability',
      subcategories: [
        { id: generateId(), name: 'Kartu Kredit', parentId: '' },
        { id: generateId(), name: 'Pinjaman', parentId: '' },
      ],
      isDefault: true,
      createdAt: now,
    },
  ]
}

/**
 * Installment subcategory options
 */
export const INSTALLMENT_SUBCATEGORIES = [
  'Kendaraan',
  'Gadget',
  'Rumah',
  'Pendidikan',
  'Lainnya',
]

/**
 * Asset type options
 */
export const ASSET_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'savings', label: 'Tabungan' },
  { value: 'investment', label: 'Investasi' },
  { value: 'gold', label: 'Emas' },
  { value: 'property', label: 'Properti' },
  { value: 'other', label: 'Lainnya' },
]

/**
 * Liability type options
 */
export const LIABILITY_TYPES = [
  { value: 'debt', label: 'Utang' },
  { value: 'loan', label: 'Pinjaman' },
  { value: 'other', label: 'Lainnya' },
]

/**
 * Priority options
 */
export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Tinggi', color: 'text-red-600' },
  { value: 'medium', label: 'Sedang', color: 'text-yellow-600' },
  { value: 'low', label: 'Rendah', color: 'text-green-600' },
]

/**
 * Payment method options
 */
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Transfer Bank' },
  { value: 'e-wallet', label: 'E-Wallet' },
]
