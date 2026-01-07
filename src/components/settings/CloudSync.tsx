/**
 * Cloud Sync Component
 * Handles login, registration, and data sync with Supabase
 */

import { useState, useEffect } from 'react'
import { Cloud, CloudOff, LogIn, LogOut, RefreshCw, Upload, Download, Mail, Lock, UserPlus, Check, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { syncLocalToCloud, syncCloudToLocal, getLastSyncTime } from '../../services/syncService'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

type View = 'status' | 'login' | 'register'

export default function CloudSync() {
  const { user, loading, error, signIn, signUp, signOut, clearError, initialized, initialize } = useAuthStore()
  const [view, setView] = useState<View>('status')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Initialize auth on mount
  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  // Fetch last sync time when user is logged in
  useEffect(() => {
    if (user) {
      getLastSyncTime(user.id).then(setLastSync)
    }
  }, [user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn(email, password)
    if (result.success) {
      setView('status')
      setEmail('')
      setPassword('')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return
    }
    const result = await signUp(email, password)
    if (result.success) {
      setView('status')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setSyncMessage({ type: 'success', text: 'Akun berhasil dibuat! Cek email untuk verifikasi.' })
    }
  }

  const handleSyncToCloud = async () => {
    if (!user) return
    setSyncing(true)
    setSyncMessage(null)
    
    const result = await syncLocalToCloud(user.id)
    
    if (result.success) {
      setSyncMessage({ type: 'success', text: `${result.synced.length} data berhasil disimpan ke cloud` })
      setLastSync(new Date())
    } else {
      setSyncMessage({ type: 'error', text: 'Gagal menyimpan ke cloud' })
    }
    
    setSyncing(false)
  }

  const handleSyncFromCloud = async () => {
    if (!user) return
    setSyncing(true)
    setSyncMessage(null)
    
    const result = await syncCloudToLocal(user.id)
    
    if (result.success) {
      setSyncMessage({ type: 'success', text: `${result.synced.length} data berhasil diunduh dari cloud. Refresh halaman untuk melihat perubahan.` })
    } else {
      setSyncMessage({ type: 'error', text: 'Tidak ada data di cloud atau gagal mengunduh' })
    }
    
    setSyncing(false)
  }

  const handleLogout = async () => {
    await signOut()
    setLastSync(null)
    setSyncMessage(null)
  }

  // Loading state
  if (!initialized) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          <span className="text-gray-500">Memuat...</span>
        </div>
      </div>
    )
  }

  // Login form
  if (view === 'login') {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#CA2851]" />
            Masuk
          </h3>
          <button
            onClick={() => { setView('status'); clearError() }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Batal
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10 w-full"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 w-full"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Masuk
          </button>

          <p className="text-sm text-center text-gray-500">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => { setView('register'); clearError() }}
              className="text-[#CA2851] hover:underline"
            >
              Daftar
            </button>
          </p>
        </form>
      </div>
    )
  }

  // Register form
  if (view === 'register') {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#CA2851]" />
            Daftar Akun
          </h3>
          <button
            onClick={() => { setView('status'); clearError() }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Batal
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10 w-full"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 w-full"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pl-10 w-full"
                placeholder="Ulangi password"
                required
                minLength={6}
              />
            </div>
          </div>

          {password !== confirmPassword && confirmPassword && (
            <p className="text-sm text-red-500">Password tidak cocok</p>
          )}

          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || password !== confirmPassword}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Daftar
          </button>

          <p className="text-sm text-center text-gray-500">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => { setView('login'); clearError() }}
              className="text-[#CA2851] hover:underline"
            >
              Masuk
            </button>
          </p>
        </form>
      </div>
    )
  }

  // Status view (default)
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        {user ? (
          <Cloud className="w-5 h-5 text-green-500" />
        ) : (
          <CloudOff className="w-5 h-5 text-gray-400" />
        )}
        <div>
          <h3 className="font-semibold">Cloud Sync</h3>
          <p className="text-sm text-gray-500">
            {user ? user.email : 'Belum terhubung'}
          </p>
        </div>
      </div>

      {syncMessage && (
        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
          syncMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {syncMessage.type === 'success' ? (
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm">{syncMessage.text}</span>
        </div>
      )}

      {user ? (
        <div className="space-y-3">
          {lastSync && (
            <p className="text-sm text-gray-500">
              Terakhir sync: {formatDistanceToNow(lastSync, { addSuffix: true, locale: id })}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSyncToCloud}
              disabled={syncing}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload
            </button>
            <button
              onClick={handleSyncFromCloud}
              disabled={syncing}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-red-500 flex items-center justify-center gap-2 py-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">
            Masuk untuk menyimpan data ke cloud dan akses dari device lain.
          </p>
          <button
            onClick={() => setView('login')}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Masuk / Daftar
          </button>
        </div>
      )}
    </div>
  )
}
