'use client'
import { useLanguage } from '@/lib/context/LanguageContext'
export default function OwnerSkeleton() {
  const { t } = useLanguage()
  return <div role="status" aria-label={t('owner.loading')} className="space-y-5"><span className="sr-only">{t('owner.loading')}</span><div className="owner-skeleton h-9 w-2/3" /><div className="owner-skeleton h-32" /><div className="grid sm:grid-cols-2 gap-4"><div className="owner-skeleton h-36" /><div className="owner-skeleton h-36" /></div><div className="owner-skeleton h-24" /><div className="owner-skeleton h-24" /></div>
}
