import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Wishlist from './pages/Wishlist'
import Savings from './pages/Savings'
import Installments from './pages/Installments'
import MonthlyNeeds from './pages/MonthlyNeeds'
import Assets from './pages/Assets'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useSettingsStore } from './store/settingsStore'
import { useCategoryStore } from './store/categoryStore'
import { useTransactionStore } from './store/transactionStore'
import { useWishlistStore } from './store/wishlistStore'
import { useInstallmentStore } from './store/installmentStore'
import { useMonthlyNeedStore } from './store/monthlyNeedStore'
import { useAssetStore } from './store/assetStore'
import { useSavingsStore } from './store/savingsStore'
import { useAuthStore } from './store/authStore'
import { useSyncStore } from './store/syncStore'
import { applySeedData } from './services/seed'

function SeedDataDialog({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Selamat Datang! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ini adalah pertama kalinya Anda menggunakan aplikasi ini. 
          Apakah Anda ingin memuat data contoh untuk melihat bagaimana aplikasi bekerja?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="btn btn-secondary flex-1"
          >
            Mulai Kosong
          </button>
          <button
            onClick={onAccept}
            className="btn btn-primary flex-1"
          >
            Muat Data Contoh
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { darkMode, initialized: settingsInit, initialize: initSettings } = useSettingsStore()
  const { categories, initialized: categoriesInit, initialize: initCategories } = useCategoryStore()
  const { transactions, initialized: transactionsInit, initialize: initTransactions } = useTransactionStore()
  const { items: wishlist, initialized: wishlistInit, initialize: initWishlist } = useWishlistStore()
  const { installments, initialized: installmentsInit, initialize: initInstallments } = useInstallmentStore()
  const { needs: monthlyNeeds, initialized: monthlyNeedsInit, initialize: initMonthlyNeeds } = useMonthlyNeedStore()
  const { assets, initialized: assetsInit, initialize: initAssets } = useAssetStore()
  const { initialized: savingsInit, initialize: initSavings } = useSavingsStore()
  const { user, initialized: authInitialized, initialize: initAuth } = useAuthStore()
  const { loadFromCloud, saveToCloud, initialize: initSync, autoSyncEnabled, isSyncing } = useSyncStore()
  const [loading, setLoading] = useState(true)
  const [showSeedDialog, setShowSeedDialog] = useState(false)
  const [cloudSyncDone, setCloudSyncDone] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataHashRef = useRef<string>('')

  // Create a simple hash of data to detect changes
  const getDataHash = useCallback(() => {
    return JSON.stringify({
      t: transactions.length,
      c: categories.length,
      w: wishlist.length,
      i: installments.length,
      m: monthlyNeeds.length,
      a: assets.length,
      // Include first item IDs to detect actual changes
      tid: transactions[0]?.id || '',
      cid: categories[0]?.id || '',
    })
  }, [transactions, categories, wishlist, installments, monthlyNeeds, assets])

  // Initialize all stores
  const initializeStores = useCallback(async () => {
    await Promise.all([
      !settingsInit && initSettings(),
      !categoriesInit && initCategories(),
      !transactionsInit && initTransactions(),
      !wishlistInit && initWishlist(),
      !installmentsInit && initInstallments(),
      !monthlyNeedsInit && initMonthlyNeeds(),
      !assetsInit && initAssets(),
      !savingsInit && initSavings(),
    ])
  }, [settingsInit, categoriesInit, transactionsInit, wishlistInit, installmentsInit, monthlyNeedsInit, assetsInit, savingsInit])

  // Initial auth setup
  useEffect(() => {
    const init = async () => {
      await initAuth()
      initSync()
    }
    init()
  }, [])

  // Load from cloud when user is authenticated
  useEffect(() => {
    const syncOnLogin = async () => {
      if (!authInitialized) return
      
      if (user && !cloudSyncDone) {
        // Check if we just synced (to prevent infinite reload)
        const justSynced = sessionStorage.getItem('pfm_just_synced')
        
        if (justSynced) {
          // Already synced, just initialize stores and continue
          sessionStorage.removeItem('pfm_just_synced')
          await initializeStores()
          setCloudSyncDone(true)
          setLoading(false)
          return
        }
        
        // Try to load from cloud
        const result = await loadFromCloud()
        
        if (result.success && result.hasData) {
          // Data was loaded from cloud - set flag and reload to pick up fresh data
          sessionStorage.setItem('pfm_just_synced', 'true')
          window.location.reload()
          return
        }
        
        // No cloud data or load failed - just initialize local stores
        await initializeStores()
        setCloudSyncDone(true)
        setLoading(false)
      } else if (!user && authInitialized) {
        // Not logged in, just initialize stores
        sessionStorage.removeItem('pfm_just_synced')
        await initializeStores()
        setLoading(false)
      }
    }
    syncOnLogin()
  }, [user, authInitialized, cloudSyncDone])

  // Auto-save to cloud when data changes (debounced)
  useEffect(() => {
    if (!user || !autoSyncEnabled || !cloudSyncDone || isSyncing) return

    const currentHash = getDataHash()
    
    // Skip if data hasn't actually changed
    if (currentHash === lastDataHashRef.current) return
    
    // Skip initial load (empty data)
    const hasData = transactions.length > 0 || categories.length > 0 || 
                    wishlist.length > 0 || installments.length > 0 || 
                    monthlyNeeds.length > 0 || assets.length > 0
    if (!hasData) return

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Save after 2 seconds of no changes
    saveTimeoutRef.current = setTimeout(async () => {
      console.log('[AutoSync] Data changed, saving to cloud...')
      lastDataHashRef.current = currentHash
      await saveToCloud()
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [transactions, categories, wishlist, installments, monthlyNeeds, assets, user, autoSyncEnabled, cloudSyncDone, isSyncing, getDataHash, saveToCloud])

  // Check if this is first time user (no data)
  useEffect(() => {
    if (!loading && transactions.length === 0 && categories.length === 0) {
      const hasSeenDialog = localStorage.getItem('pfm_seed_dialog_shown')
      if (!hasSeenDialog) {
        setShowSeedDialog(true)
      }
    }
  }, [loading, transactions.length, categories.length])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleAcceptSeed = async () => {
    applySeedData()
    localStorage.setItem('pfm_seed_dialog_shown', 'true')
    window.location.reload()
  }

  const handleDeclineSeed = () => {
    localStorage.setItem('pfm_seed_dialog_shown', 'true')
    setShowSeedDialog(false)
  }

  if (loading || (user && !cloudSyncDone)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {user ? 'Memuat data dari cloud...' : 'Memuat aplikasi...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/installments" element={<Installments />} />
                <Route path="/monthly-needs" element={<MonthlyNeeds />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
      {showSeedDialog && (
        <SeedDataDialog onAccept={handleAcceptSeed} onDecline={handleDeclineSeed} />
      )}
    </BrowserRouter>
  )
}

export default App
