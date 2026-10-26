'use client'
import Link from 'next/link'
import { Building2, Landmark, Users, ChevronRight, Clock } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { daysLeft, noticeTone, noticeTitle, noticeGroup, shortDate } from '@/lib/owner-ui'

export function useCountdown() {
  const { t } = useLanguage()
  return (notice: any) => {
    if (notice.status === 'closed') return t('owner.closed')
    if (notice.status === 'filed') return t('owner.filed')
    const days = daysLeft(notice.deadline)
    return days === null ? t('owner.noDeadline') : days < 0 ? t('owner.daysOverdue').replace('{count}', String(-days)) : days === 0 ? t('owner.today') : days === 1 ? t('owner.tomorrow') : t('owner.daysLeft').replace('{count}', String(days))
  }
}
export default function NoticeCard({ notice }: { notice: any }) {
  const { t, lang } = useLanguage()
  const countdown = useCountdown()
  const title = noticeTitle(notice)
  const Icon = title === 'incomeTax' ? Landmark : title === 'epfo' ? Users : Building2
  return <Link href={`/dashboard/notices/${notice.id}`} className="owner-notice group">
    <div className="owner-department"><Icon size={23} /></div><div className="min-w-0 flex-1 space-y-2"><div className="font-bold text-slate-900">{t(`owner.${title}`)}</div><p className="text-slate-600 break-words line-clamp-2">{notice.authority}</p><div className="flex gap-2 flex-wrap items-center"><span className={`owner-status tone-${noticeTone(notice)}`}><Clock size={15} />{countdown(notice)}</span>{notice.status !== 'closed' && <span className="text-slate-500">{t(`owner.${noticeGroup(notice)}`)}</span>}</div>{notice.deadline && <p className="text-slate-500">{shortDate(notice.deadline, lang)}</p>}</div><ChevronRight size={20} className="shrink-0 self-center text-slate-400 group-hover:text-blue-700" />
  </Link>
}
