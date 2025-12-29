import { useState, useRef, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun,
  AlertTriangle,
  Shield,
  Database,
  HardDrive,
  Cloud,
  RefreshCw,
  Loader2,
  Palette,
  Minimize2
} from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useSyncStore } from '../store/syncStore'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency } from '../utils/formatters'
import ThemeColorPicker from '../components/settings/ThemeColorPicker'
import UserProfileCard from '../components/settings/UserProfileCard'
import CurrencySettings from '../components/settings/CurrencySettings'

export default function Settings() {
  const { settings, darkMode, setDarkMode, setThemeColor, setCompactMode, updateSettings, initialize, initialized } = useSettingsStore()
  const { isSyncing, lastSynced, error: syncError, saveToCloud, loadFromCloud, autoSyncEnabled, setAutoSync } = useSyncStore()
  const { downloadExport, importData, resetData, getStorageInfo } = useStorage()
  
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [monthlyLivingCost, setMonthlyLivingCost] = useState(settings.monthlyLivingCost.toString())
  const [emergencyMultiplier, setEmergencyMultiplier] = useState(settings.emergencyFundMultiplier.toString())
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  useEffect(() => {
    setMonthlyLivingCost(settings.monthlyLivingCost.toString())
    setEmergencyMultiplier(settings.emergencyFundMultiplier.toString())
  }, [settings])

  const storageInfo = getStorageInfo()

  const handleSaveToCloud = async () => {
    setSyncMessage(null)
    const success = await saveToCloud()
    if (success) {
      setSyncMessage({ type: 'success', message: 'Data berhasil disimpan ke cloud!' })
    } else {
      setSyncMessage({ type: 'error', message: syncError || 'Gagal menyimpan ke cloud' })
    }
  }

  const handleLoadFromCloud = async () => {
    setSyncMessage(null)
    const result = await loadFromCloud()
    if (result.success) {
      if (result.hasData) {
        setSyncMessage({ type: 'success', message: 'Data berhasil dimuat dari cloud! Halaman akan di-refresh...' })
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setSyncMessage({ type: 'error', message: 'Tidak ada data di cloud untuk akun ini' })
      }
    } else {
      setSyncMessage({ type: 'error', message: syncError || 'Gagal memuat dari cloud' })
    }
  }

  const handleExport = () => {
    downloadExport()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = await importData(text, importMode)
      
      if (result.success) {
        setImportStatus({ type: 'success', message: result.message })
      } else {
        setImportStatus({ type: 'error', message: result.message })
      }
    } catch {
      setImportStatus({ type: 'error', message: 'Gagal membaca file' })
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReset = async () => {
    if (resetConfirmText === 'HAPUS') {
      await resetData()
      setShowResetConfirm(false)
      setResetConfirmText('')
    }
  }

  const handleSaveEmergencyFund = () => {
    const cost = parseFloat(monthlyLivingCost)
    const multiplier = parseInt(emergencyMultiplier)
    
    if (!isNaN(cost) && cost >= 0 && !isNaN(multiplier) && multiplier >= 1) {
      updateSettings({
        monthlyLivingCost: cost,
        emergencyFundMultiplier: multiplier,
      })
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h1>
      </div>

      {/* Storage Warning */}
      <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Data disimpan di browser lokal
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Data Anda tersimpan di browser ini saja. Lakukan export secara berkala untuk backup.
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Sync */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Sinkronisasi Cloud</h2>
        </div>

        <div className="space-y-4">
          {/* Sync Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lastSynced 
                  ? `Terakhir sync: ${new Date(lastSynced).toLocaleString('id-ID')}`
                  : 'Belum pernah sync'
                }
              </p>
            </div>
            {isSyncing && <Loader2 className="w-4 h-4 animate-spin text-primary-600" />}
          </div>

          {syncError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{syncError}</p>
            </div>
          )}

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto Sync</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Simpan otomatis ke cloud saat ada perubahan
              </p>
            </div>
            <button
              onClick={() => setAutoSync(!autoSyncEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSyncEnabled ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              syncMessage.type === 'success' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {syncMessage.message}
            </div>
          )}

          {/* Manual Sync Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveToCloud}
              disabled={isSyncing}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Simpan ke Cloud
            </button>
            <button
              onClick={handleLoadFromCloud}
              disabled={isSyncing}
              className="btn btn-secondary flex items-center justify-center gap-2"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Muat dari Cloud
            </button>
          </div>
        </div>
      </div>

      {/* Dark Mode */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            ) : (
              <Sun className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Mode Gelap</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {darkMode ? 'Aktif' : 'Nonaktif'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Personalization */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Personalisasi</h2>
        </div>

        <div className="space-y-6">
          {/* User Profile */}
          <UserProfileCard
            userName={settings.userName || ''}
            userAvatar={settings.userAvatar || ''}
            onNameChange={(name) => updateSettings({ userName: name })}
            onAvatarChange={(avatar) => updateSettings({ userAvatar: avatar })}
          />

          {/* Theme Color */}
          <ThemeColorPicker
            value={settings.themeColor || 'blue'}
            onChange={setThemeColor}
          />

          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Minimize2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Mode Kompak</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tampilan lebih padat dengan ukuran font lebih kecil
                </p>
              </div>
            </div>
            <button
              onClick={() => setCompactMode(!settings.compactMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.compactMode ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Currency Settings */}
          <CurrencySettings
            currency={settings.currency}
            currencyDisplay={settings.currencyDisplay || 'symbol'}
            onCurrencyChange={(currency) => updateSettings({ currency })}
            onDisplayChange={(display) => updateSettings({ currencyDisplay: display })}
          />
        </div>
      </div>

      {/* Emergency Fund Settings */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Dana Darurat</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Biaya Hidup Bulanan
            </label>
            <input
              type="number"
              value={monthlyLivingCost}
              onChange={(e) => setMonthlyLivingCost(e.target.value)}
              className="input w-full"
              min="0"
              step="100000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Estimasi pengeluaran bulanan untuk kebutuhan pokok
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Kelipatan
            </label>
            <select
              value={emergencyMultiplier}
              onChange={(e) => setEmergencyMultiplier(e.target.value)}
              className="input w-full"
            >
              {[3, 6, 9, 12].map(n => (
                <option key={n} value={n}>{n}x biaya hidup</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Target: {formatCurrency(parseFloat(monthlyLivingCost || '0') * parseInt(emergencyMultiplier || '6'))}
            </p>
          </div>

          <button
            onClick={handleSaveEmergencyFund}
            className="btn btn-primary w-full"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Backup & Restore</h2>
        </div>

        <div className="space-y-4">
          {/* Export */}
          <button
            onClick={handleExport}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data (JSON)
          </button>

          {/* Import */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                className="input flex-1"
              >
                <option value="merge">Gabungkan dengan data yang ada</option>
                <option value="replace">Ganti semua data</option>
              </select>
            </div>
            <button
              onClick={handleImportClick}
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {importStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              importStatus.type === 'success' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {importStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Storage Info */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Informasi Penyimpanan</h2>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Record</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{storageInfo.totalRecords}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Ukuran Data</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{formatBytes(storageInfo.storageUsed)}</span>
          </div>
          <div className="border-t dark:border-gray-700 pt-2 mt-2">
            <p className="text-gray-500 dark:text-gray-400 mb-1">Detail:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span>Transaksi: {storageInfo.tables.transactions}</span>
              <span>Kategori: {storageInfo.tables.categories}</span>
              <span>Wishlist: {storageInfo.tables.wishlist}</span>
              <span>Cicilan: {storageInfo.tables.installments}</span>
              <span>Kebutuhan: {storageInfo.tables.monthlyNeeds}</span>
              <span>Aset: {storageInfo.tables.assets}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Data */}
      <div className="card p-4 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="font-semibold text-red-600 dark:text-red-400">Hapus Semua Data</h2>
        </div>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn bg-red-600 hover:bg-red-700 text-white w-full"
          >
            Reset Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600 dark:text-red-400">
              Tindakan ini tidak dapat dibatalkan. Ketik <strong>HAPUS</strong> untuk konfirmasi.
            </p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Ketik HAPUS"
              className="input w-full border-red-300 dark:border-red-700"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResetConfirm(false)
                  setResetConfirmText('')
                }}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                disabled={resetConfirmText !== 'HAPUS'}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
