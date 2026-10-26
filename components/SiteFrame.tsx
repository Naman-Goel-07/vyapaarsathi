'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/context/LanguageContext'
import './owner/owner.css'

export default function SiteFrame({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const { t, lang, toggleLanguage } = useLanguage()
  return (
    <div className="owner-app">
      <header className={`owner-header ${wide ? 'site-header-wide' : ''}`}>
        <Link href="/" className="flex items-center gap-2">
          <span className="site-logo" aria-hidden="true">व</span>
          <span>{t('common.vyapaarSathi')}</span>
        </Link>
        <button className="owner-language" onClick={toggleLanguage} aria-label={t('owner.language')}>
          {lang === 'en' ? t('owner.hindi') : t('owner.english')}
        </button>
      </header>
      <main className="site-main">{children}</main>
    </div>
  )
}
