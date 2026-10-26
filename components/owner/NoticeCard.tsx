'use client'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { extractDemandAmount } from '@/lib/demand'
import { daysLeft, money, noticeTitle, noticeTone, waitingOnOwner } from '@/lib/owner-ui'

const SHORT: Record<string, string> = { gst: 'GST', incomeTax: 'IT', epfo: 'PF', other: 'Govt' }

export function useCountdown() {
  const { t } = useLanguage()
  return (notice: any) => {
    if (notice.status === 'closed') return t('owner.closed')
    if (notice.status === 'filed') return t('owner.filed')
    const days = daysLeft(notice.deadline)
    if (days === null) return t('owner.noDeadline')
    if (days < 0) return t('owner.daysOverdue').replace('{count}', String(-days))
    if (days === 0) return t('owner.today')
    if (days === 1) return t('owner.tomorrow')
    return t('owner.daysLeft').replace('{count}', String(days))
  }
}

export function useStatusLine() {
  const { t } = useLanguage()
  return (notice: any) =>
    notice.status === 'closed' ? t('owner.closedHint')
    : notice.status === 'filed' ? t('owner.filedHint')
    : waitingOnOwner(notice) ? t('owner.yourTurn')
    : t('owner.caChecking')
}

export default function NoticeCard({ notice }: { notice: any }) {
  const { t } = useLanguage()
  const countdown = useCountdown()
  const statusLine = useStatusLine()
  const kind = noticeTitle(notice)
  const amount = extractDemandAmount(notice)
  const isOpen = notice.status !== 'closed' && notice.status !== 'filed'
  return (
    <Link href={`/dashboard/notices/${notice.id}`} className="owner-notice">
      <span className={`owner-badge badge-${kind}`} aria-hidden="true">{SHORT[kind]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{t(`owner.${kind}`)}</p>
        <p className={`owner-sub truncate ${isOpen && waitingOnOwner(notice) ? 'owner-alert' : ''}`}>{statusLine(notice)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {amount > 0 && <span className={`owner-amount ${isOpen ? '' : 'owner-sub'}`}>{money(amount)}</span>}
        {isOpen
          ? <span className={`owner-status tone-${noticeTone(notice)}`}>{countdown(notice)}</span>
          : <span className="owner-sub flex items-center gap-1" style={{ color: 'var(--green)' }}><Check size={14} />{countdown(notice)}</span>}
      </div>
    </Link>
  )
}
