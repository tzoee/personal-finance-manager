/**
 * UserProfileCard Component
 * User profile with avatar and name
 */

import { useState, useRef } from 'react'
import { User, Camera, X } from 'lucide-react'

interface UserProfileCardProps {
  userName: string
  userAvatar: string
  onNameChange: (name: string) => void
  onAvatarChange: (avatar: string) => void
}

export default function UserProfileCard({
  userName,
  userAvatar,
  onNameChange,
  onAvatarChange,
}: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(userName)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 500KB)
    if (file.size > 500 * 1024) {
      alert('Ukuran file maksimal 500KB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      onAvatarChange(result)
    }
    reader.readAsDataURL(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = () => {
    onAvatarChange('')
  }

  const handleSaveName = () => {
    onNameChange(tempName.trim())
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setTempName(userName)
      setIsEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl">
      {/* Avatar */}
      <div className="relative group">
        <div 
          className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-primary-200 dark:border-primary-700"
          onClick={handleAvatarClick}
        >
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>
        
        {/* Camera overlay */}
        <div 
          className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleAvatarClick}
        >
          <Camera className="w-5 h-5 text-white" />
        </div>

        {/* Remove button */}
        {userAvatar && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Name */}
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveName}
              autoFocus
              placeholder="Nama Anda"
              className="flex-1 px-3 py-1.5 text-lg font-semibold bg-white dark:bg-gray-700 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        ) : (
          <div 
            className="cursor-pointer group"
            onClick={() => {
              setTempName(userName)
              setIsEditing(true)
            }}
          >
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {userName || 'Klik untuk menambah nama'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Klik untuk mengedit
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
