'use client'
import { useState } from 'react'
import { loginAsDemo } from '@/app/actions'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function DemoButtons() {
  const { t } = useLanguage()
  const [pending, setPending] = useState<'owner' | 'ca' | null>(null)
  return (
    <div className="space-y-2">
      <p className="owner-sub">{t('site.demoTitle')}</p>
      <div className="grid grid-cols-2 gap-2">
        {(['owner', 'ca'] as const).map(role => (
          <form key={role} action={loginAsDemo} onSubmit={() => setPending(role)}>
            <input type="hidden" name="role" value={role} />
            <button type="submit" className="owner-secondary w-full" disabled={pending !== null}>
              {pending === role ? t('site.loggingIn') : t(role === 'ca' ? 'site.demoCA' : 'site.demoOwner')}
            </button>
          </form>
        ))}
      </div>
    </div>
  )
}
