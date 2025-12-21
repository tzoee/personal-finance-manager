import { create } from 'zustand'
import type { WishlistItem, WishlistInput } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO } from '../utils/dateUtils'

interface WishlistState {
  items: WishlistItem[]
  initialized: boolean
  initialize: () => Promise<void>
  addItem: (input: WishlistInput) => Promise<WishlistItem>
  updateItem: (id: string, input: Partial<WishlistInput>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  markAsBought: (id: string) => Promise<void>
  updateSavedAmount: (id: string, amount: number) => Promise<void>
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_wishlist')
      if (stored) {
        const parsed = JSON.parse(stored) as WishlistItem[]
        set({ items: parsed, initialized: true })
      } else {
        set({ items: [], initialized: true })
      }
    } catch {
      set({ items: [], initialized: true })
    }
  },

  addItem: async (input: WishlistInput) => {
    const { items } = get()
    const now = getNowISO()

    const newItem: WishlistItem = {
      id: generateId(),
      name: input.name.trim(),
      targetPrice: input.targetPrice,
      priority: input.priority,
      targetDate: input.targetDate,
      currentSaved: input.currentSaved ?? 0,
      status: 'planned',
      note: input.note,
      createdAt: now,
      updatedAt: now,
    }

    const updated = [...items, newItem]
    localStorage.setItem('pfm_wishlist', JSON.stringify(updated))
    set({ items: updated })

    return newItem
  },

  updateItem: async (id: string, input: Partial<WishlistInput>) => {
    const { items } = get()
    const now = getNowISO()

    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...input,
          name: input.name?.trim() ?? item.name,
          updatedAt: now,
        }
      }
      return item
    })

    localStorage.setItem('pfm_wishlist', JSON.stringify(updated))
    set({ items: updated })
  },

  deleteItem: async (id: string) => {
    const { items } = get()
    const updated = items.filter(item => item.id !== id)
    localStorage.setItem('pfm_wishlist', JSON.stringify(updated))
    set({ items: updated })
  },

  markAsBought: async (id: string) => {
    const { items } = get()
    const now = getNowISO()

    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'bought' as const,
          updatedAt: now,
        }
      }
      return item
    })

    localStorage.setItem('pfm_wishlist', JSON.stringify(updated))
    set({ items: updated })
  },

  updateSavedAmount: async (id: string, amount: number) => {
    const { items } = get()
    const now = getNowISO()

    const updated = items.map(item => {
      if (item.id === id) {
        const newStatus = amount >= item.targetPrice ? 'saving' : item.status
        return {
          ...item,
          currentSaved: amount,
          status: item.status === 'bought' ? 'bought' : newStatus,
          updatedAt: now,
        }
      }
      return item
    })

    localStorage.setItem('pfm_wishlist', JSON.stringify(updated))
    set({ items: updated })
  },
}))
