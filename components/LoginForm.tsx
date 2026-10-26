'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/context/LanguageContext'
import SiteFrame from '@/components/SiteFrame'
import DemoButtons from '@/components/DemoButtons'

interface LoginFormProps {
  loginAction: (formData: FormData) => void
  searchParams?: { message?: string; error?: string }
  demoEnabled?: boolean
}

export default function LoginForm({ loginAction, searchParams, demoEnabled = false }: LoginFormProps) {
  const { t } = useLanguage()
  const [busy, setBusy] = useState(false)
  useEffect(() => setBusy(false), [searchParams?.error])
  const error = searchParams?.error
  const errorText = error && /invalid login/i.test(error) ? t('site.badLogin') : error
  return (
    <SiteFrame>
      <div className="site-narrow space-y-5">
        <div>
          <h1 className="owner-page-title">{t('site.welcomeBack')}</h1>
          <p className="owner-sub mt-1">{t('site.loginText')}</p>
        </div>
        {searchParams?.message && <p className="tone-fine rounded-xl border p-3">{searchParams.message}</p>}
        {errorText && <p role="alert" className="tone-overdue rounded-xl border p-3">{errorText}</p>}
        <form className="owner-card space-y-4" action={loginAction} onSubmit={() => setBusy(true)}>
          <label className="owner-field">{t('site.email')}<input name="email" type="email" autoComplete="email" required /></label>
          <label className="owner-field">{t('site.password')}<input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit" className="owner-primary w-full" disabled={busy}>{busy ? t('site.loggingIn') : t('site.login')}</button>
        </form>
        <p className="text-center">{t('site.noAccount')} <Link href="/signup" className="owner-text-link">{t('site.createAccount')}</Link></p>
        {demoEnabled && <div className="owner-card"><DemoButtons /></div>}
      </div>
    </SiteFrame>
  )
}
