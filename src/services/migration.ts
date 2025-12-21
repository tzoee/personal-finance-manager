import type { AppData } from '../types'
import { CURRENT_SCHEMA_VERSION } from '../constants/defaults'

/**
 * Migration functions for upgrading data between schema versions
 */

interface MigrationFunction {
  (data: AppData): AppData
}

const migrations: Record<number, MigrationFunction> = {
  // Migration from version 0 (no version) to version 1
  1: (data: AppData): AppData => {
    // Add schemaVersion to settings if missing
    if (!data.settings.schemaVersion) {
      data.settings.schemaVersion = 1
    }
    return data
  },
  // Future migrations can be added here
  // 2: (data: AppData): AppData => { ... }
}

/**
 * Migrate data from old version to current version
 */
export function migrateData(data: AppData): AppData {
  let currentVersion = data.version || 0
  let migratedData = { ...data }

  // Apply migrations sequentially
  while (currentVersion < CURRENT_SCHEMA_VERSION) {
    const nextVersion = currentVersion + 1
    const migrationFn = migrations[nextVersion]

    if (migrationFn) {
      migratedData = migrationFn(migratedData)
      migratedData.version = nextVersion
    }

    currentVersion = nextVersion
  }

  return migratedData
}

/**
 * Check if data needs migration
 */
export function needsMigration(data: AppData): boolean {
  const dataVersion = data.version || 0
  return dataVersion < CURRENT_SCHEMA_VERSION
}

/**
 * Validate imported data structure
 */
export function validateImportData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data tidak valid'] }
  }

  const appData = data as Partial<AppData>

  // Check required fields
  if (!Array.isArray(appData.transactions)) {
    errors.push('Field transactions tidak valid')
  }

  if (!Array.isArray(appData.categories)) {
    errors.push('Field categories tidak valid')
  }

  // Validate transactions structure
  if (appData.transactions) {
    for (let i = 0; i < appData.transactions.length; i++) {
      const tx = appData.transactions[i]
      if (!tx.id || !tx.date || !tx.type || typeof tx.amount !== 'number') {
        errors.push(`Transaksi index ${i} tidak valid`)
        break
      }
    }
  }

  // Validate categories structure
  if (appData.categories) {
    for (let i = 0; i < appData.categories.length; i++) {
      const cat = appData.categories[i]
      if (!cat.id || !cat.name || !cat.type) {
        errors.push(`Kategori index ${i} tidak valid`)
        break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get migration info
 */
export function getMigrationInfo(data: AppData): {
  currentVersion: number
  targetVersion: number
  needsMigration: boolean
} {
  const currentVersion = data.version || 0
  return {
    currentVersion,
    targetVersion: CURRENT_SCHEMA_VERSION,
    needsMigration: currentVersion < CURRENT_SCHEMA_VERSION,
  }
}
