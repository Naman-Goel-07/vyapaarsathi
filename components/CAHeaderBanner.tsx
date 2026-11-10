'use client'

import React from 'react'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function CAHeaderBanner() {
  const { t } = useLanguage()

  return (
    <header className="ca-intro">
      <p className="ca-kicker">{t('ca.workspace')}</p>
      <h1>{t('ca.title')}</h1>
      <p className="ca-muted">{t('ca.intro')}</p>
    </header>
  )
}
