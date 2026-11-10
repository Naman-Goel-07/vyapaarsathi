'use client'

import React from 'react'
import { LogOut, Send } from 'lucide-react'
import Link from 'next/link'
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
    <div className={role === 'ca' ? 'ca-header-controls' : 'flex items-center gap-3 sm:gap-4'}>
      {/* Government-Style Language Toggle */}
      <LanguageToggle showIcon={role !== 'ca'} />
      {role === 'ca' && (
        <Link href="/dashboard/telegram" className="ca-header-action" aria-label={t('ca.telegram')} title={t('ca.telegram')}>
          <Send size={18} aria-hidden="true" />
          <span className="hidden md:inline">{t('ca.telegram')}</span>
        </Link>
      )}

      {/* Role Badge */}
      {role !== 'ca' && <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-medium px-2 py-1 bg-ink text-white rounded-sm uppercase tracking-wider">
          {roleLabel}
        </span>
      </div>}

      {/* Logout Action */}
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className={role === 'ca' ? 'ca-header-action' : 'flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-post-red transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-100'}
          title={logoutLabel}
          aria-label={logoutLabel}
        >
          <LogOut size={16} />
          <span className={role === 'ca' ? 'hidden md:inline' : 'hidden sm:inline font-sans'}>{logoutLabel}</span>
        </button>
      </form>
    </div>
  )
}
