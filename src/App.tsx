import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
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
  const { initialized: wishlistInit, initialize: initWishlist } = useWishlistStore()
  const { initialized: installmentsInit, initialize: initInstallments } = useInstallmentStore()
  const { initialized: monthlyNeedsInit, initialize: initMonthlyNeeds } = useMonthlyNeedStore()
  const { initialized: assetsInit, initialize: initAssets } = useAssetStore()
  const { initialized: savingsInit, initialize: initSavings } = useSavingsStore()
  const { user, initialize: initAuth } = useAuthStore()
  const { loadFromCloud, saveToCloud, initialize: initSync, autoSyncEnabled } = useSyncStore()
  const [loading, setLoading] = useState(true)
  const [showSeedDialog, setShowSeedDialog] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'saving'>('idle')

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

  useEffect(() => {
    const init = async () => {
      // Initialize auth first
      await initAuth()
      initSync()
      setLoading(false)
    }
    init()
  }, [])

  // Load from cloud when user logs in
  useEffect(() => {
    const syncOnLogin = async () => {
      if (user && !loading) {
        setSyncStatus('loading')
        const result = await loadFromCloud()
        
        if (result.success && result.hasData) {
          // Reload stores with cloud data
          window.location.reload()
        } else {
          // No cloud data, initialize local stores
          await initializeStores()
        }
        setSyncStatus('idle')
      } else if (!user && !loading) {
        // Not logged in, just initialize stores
        await initializeStores()
      }
    }
    syncOnLogin()
  }, [user, loading])

  // Auto-save to cloud when data changes (debounced)
  useEffect(() => {
    if (!user || !autoSyncEnabled || syncStatus !== 'idle') return

    const saveTimeout = setTimeout(async () => {
      if (transactions.length > 0 || categories.length > 0) {
        setSyncStatus('saving')
        await saveToCloud()
        setSyncStatus('idle')
      }
    }, 5000) // Save 5 seconds after last change

    return () => clearTimeout(saveTimeout)
  }, [transactions, categories, user, autoSyncEnabled])

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

  if (loading || syncStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {syncStatus === 'loading' ? 'Memuat data dari cloud...' : 'Memuat aplikasi...'}
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
