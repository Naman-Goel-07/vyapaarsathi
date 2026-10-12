'use client'

import React from 'react'
import { LogOut } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'

interface DashboardHeaderControlsProps {
  role?: string
}

export default function DashboardHeaderControls({ role }: DashboardHeaderControlsProps) {
  const { t } = useLanguage()

  const roleLabel = role === 'ca' ? t('roles.caBench', 'CA Bench') : t('roles.ownerDesk', 'Owner Desk')
  const logoutLabel = t('common.logout', 'Logout')

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Government-Style Language Toggle */}
      <LanguageToggle />

      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-medium px-2 py-1 bg-ink text-white rounded-sm uppercase tracking-wider">
          {roleLabel}
        </span>
      </div>

      {/* Logout Action */}
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-post-red transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-100"
          title={logoutLabel}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline font-sans">{logoutLabel}</span>
        </button>
      </form>
    </div>
  )
}
