'use client'
import Link from 'next/link'
import { Phone, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { useOwner } from './OwnerShell'

export default function CAStrip() {
  const { initialCA, contact } = useOwner()
  const { t } = useLanguage()
  const initials = (initialCA?.name || 'CA').split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <section className="owner-card flex items-center gap-3">
      <div className="owner-avatar" aria-hidden="true">{initials}</div>
      <div className="flex-1 min-w-0">
        <p className="owner-sub">{t('owner.yourCA')}</p>
        <p className="font-semibold truncate">{initialCA ? initialCA.name : t('owner.noCA')}</p>
      </div>
      {initialCA ? (
        <>
          <button className="owner-icon" aria-label={t('owner.call')} onClick={() => contact('call')}><Phone size={20} /></button>
          <button className="owner-icon" aria-label={t('owner.whatsapp')} onClick={() => contact('whatsapp')} style={{ color: 'var(--green)' }}><MessageCircle size={20} /></button>
        </>
      ) : (
        <Link className="owner-text-link" href="/dashboard/owner/ca">{t('owner.connect')}</Link>
      )}
    </section>
  )
}
