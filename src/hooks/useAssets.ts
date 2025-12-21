import { useEffect, useCallback, useMemo } from 'react'
import { useAssetStore } from '../store/assetStore'
import type { Asset, AssetInput, NetWorthHistory } from '../types'
import { getCurrentDate } from '../utils/dateUtils'
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns'

export function useAssets() {
  const {
    assets,
    initialized,
    initialize,
    addAsset: storeAddAsset,
    updateAsset: storeUpdateAsset,
    updateAssetValue: storeUpdateAssetValue,
    deleteAsset: storeDeleteAsset,
    getNetWorth,
    getTotalAssets,
    getTotalLiabilities,
  } = useAssetStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  const addAsset = useCallback(async (input: AssetInput): Promise<Asset> => {
    return storeAddAsset(input)
  }, [storeAddAsset])

  const updateAsset = useCallback(async (id: string, input: Partial<AssetInput>): Promise<void> => {
    return storeUpdateAsset(id, input)
  }, [storeUpdateAsset])

  const updateAssetValue = useCallback(async (id: string, newValue: number): Promise<void> => {
    return storeUpdateAssetValue(id, newValue)
  }, [storeUpdateAssetValue])

  const deleteAsset = useCallback(async (id: string): Promise<void> => {
    return storeDeleteAsset(id)
  }, [storeDeleteAsset])

  // Get assets only (not liabilities)
  const assetsOnly = useMemo(() => {
    return assets.filter(a => !a.isLiability)
  }, [assets])

  // Get liabilities only
  const liabilitiesOnly = useMemo(() => {
    return assets.filter(a => a.isLiability)
  }, [assets])

  // Calculate net worth history for the last N months
  const getNetWorthHistory = useCallback((months: number = 6): NetWorthHistory[] => {
    const history: NetWorthHistory[] = []
    const today = parseISO(getCurrentDate())

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = subMonths(today, i)
      const monthStart = startOfMonth(targetDate)
      const monthEnd = endOfMonth(targetDate)
      const monthKey = format(targetDate, 'yyyy-MM')

      let totalAssets = 0
      let totalLiabilities = 0

      assets.forEach(asset => {
        // Find the latest value history entry for this month or before
        const relevantHistory = asset.valueHistory
          .filter(h => parseISO(h.date) <= monthEnd)
          .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

        const value = relevantHistory.length > 0 ? relevantHistory[0].value : 0

        if (asset.isLiability) {
          totalLiabilities += value
        } else {
          totalAssets += value
        }
      })

      history.push({
        month: monthKey,
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
      })
    }

    return history
  }, [assets])

  // Get asset by ID
  const getAssetById = useCallback((id: string): Asset | undefined => {
    return assets.find(a => a.id === id)
  }, [assets])

  // Get value change for an asset
  const getValueChange = useCallback((asset: Asset): { amount: number; percentage: number } => {
    if (asset.valueHistory.length < 2) {
      return { amount: 0, percentage: 0 }
    }

    const sorted = [...asset.valueHistory].sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    )

    const current = sorted[0].value
    const previous = sorted[1].value

    const amount = current - previous
    const percentage = previous !== 0 ? (amount / previous) * 100 : 0

    return { amount, percentage }
  }, [])

  return {
    assets,
    assetsOnly,
    liabilitiesOnly,
    initialized,
    addAsset,
    updateAsset,
    updateAssetValue,
    deleteAsset,
    getNetWorth,
    getTotalAssets,
    getTotalLiabilities,
    getNetWorthHistory,
    getAssetById,
    getValueChange,
  }
}
