'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import DashboardHeaderControls from './DashboardHeaderControls'
import './ca-dashboard.css'

export default function CADashboardShell({ children, reference }: { children: React.ReactNode; reference: string }) {
  const { t } = useLanguage()

  return (
    <div className="ca-shell">
      <header className="ca-chrome">
        <div className="ca-chrome-inner">
          <Link href="/dashboard/ca" className="ca-brand">
            <BookOpen size={22} aria-hidden="true" />
            <span>{t('common.vyapaarSathi')}</span>
          </Link>
          <span className="ca-reference">{t('common.ref')} {reference}</span>
          <DashboardHeaderControls role="ca" />
        </div>
      </header>
      <main className="ca-shell-main">{children}</main>
    </div>
  )
}
