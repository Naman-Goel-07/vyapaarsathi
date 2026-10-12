'use client'

import React from 'react'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function CAHeaderBanner() {
  const { t } = useLanguage()

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-ink"></div>
      <div className="pl-4">
        <h2 className="text-2xl font-bold font-serif tracking-tight">
          {t('caDashboard.docketTitle', 'Active Docket & Client Roster')}
        </h2>
        <p className="text-gray-500 text-sm font-medium mt-1">
          {t('caDashboard.docketSub', 'Registry of pending statutory actions and retained enterprises.')}
        </p>
      </div>
    </div>
  )
}
