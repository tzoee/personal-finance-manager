import { create } from 'zustand'
import type { Asset, AssetInput, AssetValueHistory } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO, getCurrentDate } from '../utils/dateUtils'

interface AssetState {
  assets: Asset[]
  initialized: boolean
  initialize: () => Promise<void>
  addAsset: (input: AssetInput) => Promise<Asset>
  updateAsset: (id: string, input: Partial<AssetInput>) => Promise<void>
  updateAssetValue: (id: string, newValue: number) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  getNetWorth: () => number
  getTotalAssets: () => number
  getTotalLiabilities: () => number
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_assets')
      if (stored) {
        const parsed = JSON.parse(stored) as Asset[]
        set({ assets: parsed, initialized: true })
      } else {
        set({ assets: [], initialized: true })
      }
    } catch {
      set({ assets: [], initialized: true })
    }
  },

  addAsset: async (input: AssetInput) => {
    const { assets } = get()
    const now = getNowISO()
    const today = getCurrentDate()

    const initialHistory: AssetValueHistory = {
      date: today,
      value: input.currentValue,
    }

    const newAsset: Asset = {
      id: generateId(),
      name: input.name.trim(),
      type: input.type,
      isLiability: input.isLiability,
      initialValue: input.initialValue,
      currentValue: input.currentValue,
      valueHistory: [initialHistory],
      createdAt: now,
      updatedAt: now,
    }

    const updated = [...assets, newAsset]
    localStorage.setItem('pfm_assets', JSON.stringify(updated))
    set({ assets: updated })

    return newAsset
  },

  updateAsset: async (id: string, input: Partial<AssetInput>) => {
    const { assets } = get()
    const now = getNowISO()

    const updated = assets.map(asset => {
      if (asset.id === id) {
        return {
          ...asset,
          ...input,
          name: input.name?.trim() ?? asset.name,
          updatedAt: now,
        }
      }
      return asset
    })

    localStorage.setItem('pfm_assets', JSON.stringify(updated))
    set({ assets: updated })
  },

  updateAssetValue: async (id: string, newValue: number) => {
    const { assets } = get()
    const now = getNowISO()
    const today = getCurrentDate()

    const updated = assets.map(asset => {
      if (asset.id === id) {
        // Check if we already have an entry for today
        const todayIndex = asset.valueHistory.findIndex(h => h.date === today)
        let newHistory: AssetValueHistory[]

        if (todayIndex >= 0) {
          // Update today's entry
          newHistory = [...asset.valueHistory]
          newHistory[todayIndex] = { date: today, value: newValue }
        } else {
          // Add new entry
          newHistory = [...asset.valueHistory, { date: today, value: newValue }]
        }

        return {
          ...asset,
          currentValue: newValue,
          valueHistory: newHistory,
          updatedAt: now,
        }
      }
      return asset
    })

    localStorage.setItem('pfm_assets', JSON.stringify(updated))
    set({ assets: updated })
  },

  deleteAsset: async (id: string) => {
    const { assets } = get()
    const updated = assets.filter(asset => asset.id !== id)
    localStorage.setItem('pfm_assets', JSON.stringify(updated))
    set({ assets: updated })
  },

  getNetWorth: () => {
    const { assets } = get()
    return assets.reduce((total, asset) => {
      if (asset.isLiability) {
        return total - asset.currentValue
      }
      return total + asset.currentValue
    }, 0)
  },

  getTotalAssets: () => {
    const { assets } = get()
    return assets
      .filter(asset => !asset.isLiability)
      .reduce((total, asset) => total + asset.currentValue, 0)
  },

  getTotalLiabilities: () => {
    const { assets } = get()
    return assets
      .filter(asset => asset.isLiability)
      .reduce((total, asset) => total + asset.currentValue, 0)
  },
}))
