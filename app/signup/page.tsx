'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Store, Briefcase } from 'lucide-react'
import { signup } from '../actions'
import { useLanguage } from '@/lib/context/LanguageContext'
import SiteFrame from '@/components/SiteFrame'

const ROLES = [
  { key: 'owner', icon: Store, title: 'site.roleOwner', hint: 'site.roleOwnerHint' },
  { key: 'ca', icon: Briefcase, title: 'site.roleCA', hint: 'site.roleCAHint' },
] as const

export default function SignupPage({ searchParams }: { searchParams?: { error?: string; message?: string; role?: string } }) {
  const { t } = useLanguage()
  const [role, setRole] = useState<'owner' | 'ca'>(searchParams?.role === 'ca' ? 'ca' : 'owner')
  const [busy, setBusy] = useState(false)
  useEffect(() => setBusy(false), [searchParams?.error])
  return (
    <SiteFrame>
      <div className="site-narrow space-y-5">
        <div>
          <h1 className="owner-page-title">{t('site.signupTitle')}</h1>
          <p className="owner-sub mt-1">{t('site.signupText')}</p>
        </div>
        {searchParams?.error && (
          <div role="alert" className="tone-overdue rounded-xl border p-3">
            <p className="font-semibold">{t('site.signupFailed')}</p>
            <p className="text-sm mt-1">{searchParams.error}</p>
          </div>
        )}
        <form className="owner-card space-y-4" action={signup} onSubmit={() => setBusy(true)}>
          <fieldset className="space-y-2">
            <legend className="font-medium mb-2">{t('site.whoAreYou')}</legend>
            {ROLES.map(({ key, icon: Icon, title, hint }) => (
              <label key={key} className={`owner-role ${role === key ? 'is-selected' : ''}`}>
                <input type="radio" name="role" value={key} checked={role === key} onChange={() => setRole(key)} className="sr-only" />
                <Icon size={22} aria-hidden="true" style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
                <span>
                  <span className="block font-semibold">{t(title)}</span>
                  <span className="owner-sub">{t(hint)}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {role === 'owner' && (
            <label className="owner-field">{t('site.businessName')}<input name="businessName" placeholder={t('site.businessPlaceholder')} required /></label>
          )}
          <label className="owner-field">{t('site.email')}<input name="email" type="email" autoComplete="email" required /></label>
          <label className="owner-field">
            {t('site.password')}
            <input name="password" type="password" autoComplete="new-password" minLength={6} required />
            <span className="owner-sub font-normal">{t('site.passwordHint')}</span>
          </label>
          <button type="submit" className="owner-primary w-full" disabled={busy}>{busy ? t('site.creating') : t('site.start')}</button>
        </form>
        <p className="text-center">{t('site.haveAccount')} <Link href="/login" className="owner-text-link">{t('site.login')}</Link></p>
      </div>
    </SiteFrame>
  )
}
