'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Inbox } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { shortDate } from '@/lib/owner-ui'
import { extractDemandAmount, formatDemandDisplay as money } from '@/lib/demand'

type Notice = {
  id: string
  authority?: string
  form?: string
  issue?: string
  deadline?: string | null
  status?: string
  penalty_amount?: number
  penalty?: number
  demand_amount?: number
  amount?: number
  metadata?: any
  business_id?: string
  businesses?: { id?: string; name: string } | null
}

export default function CATriageHeatmap({
  notices,
  selectedBusinessId
}: {
  notices: Notice[]
  selectedBusinessId?: string | null
}) {
  const { t, lang } = useLanguage()
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SAFE'>('ALL')
  
  const today = new Date()

  // Filter by selected business if specified
  const scopedNotices = selectedBusinessId
    ? notices.filter(n => n.business_id === selectedBusinessId || (n.businesses as any)?.id === selectedBusinessId)
    : notices

  // Decorate notices with threat levels
  const decoratedNotices = scopedNotices.map(notice => {
    let threatLevel: 'CRITICAL' | 'WARNING' | 'SAFE' = 'SAFE'
    let threatScore = 0
    let daysLeft = 999

    if (notice.status !== 'closed' && notice.status !== 'filed' && notice.deadline) {
      const deadlineDate = new Date(notice.deadline)
      const diffMs = deadlineDate.getTime() - today.getTime()
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

      if (daysLeft <= 3) threatLevel = 'CRITICAL'
      else if (daysLeft <= 7) threatLevel = 'WARNING'
      
      const penalty = extractDemandAmount(notice) || 50000
      // Higher score is worse. If overdue, make score massively high.
      threatScore = daysLeft <= 0 ? penalty * 100 : penalty / daysLeft
    } else if (notice.status === 'filed' || notice.status === 'closed') {
      threatLevel = 'SAFE'
      threatScore = -1
    }

    return { ...notice, threatLevel, threatScore, daysLeft }
  })

  // Sort descending by threat score
  decoratedNotices.sort((a, b) => b.threatScore - a.threatScore)

  const filteredNotices = decoratedNotices.filter(n => filter === 'ALL' || n.threatLevel === filter)

  const criticalCount = decoratedNotices.filter(n => n.threatLevel === 'CRITICAL').length
  const warningCount = decoratedNotices.filter(n => n.threatLevel === 'WARNING').length
  const safeCount = decoratedNotices.filter(n => n.threatLevel === 'SAFE').length

  const filters = [
    ['ALL', notices.length],
    ['CRITICAL', criticalCount],
    ['WARNING', warningCount],
    ['SAFE', safeCount],
  ] as const

  return (
    <section className="ca-panel ca-queue" aria-labelledby="ca-queue-title">
      <header className="ca-panel-heading">
        <h2 id="ca-queue-title">{t('ca.queue')}</h2>
        <p className="ca-muted">{t('ca.queueHint')}</p>
        <div className="ca-filters" role="group" aria-label={t('ca.filters')}>
          {filters.map(([key, count]) => (
            <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key}>
              {t(`ca.${key}`)} <span>{count}</span>
            </button>
          ))}
        </div>
      </header>

      {filteredNotices.length === 0 ? (
        <div className="ca-queue-empty">
          <Inbox size={30} aria-hidden="true" />
          <h3>{t('ca.noNotices')}</h3>
          <p className="ca-muted">{t('ca.noNoticesHint')}</p>
        </div>
      ) : (
        <ul className="ca-notice-list">
          {filteredNotices.map(notice => {
            const isFiled = notice.status === 'filed'
            const isClosed = notice.status === 'closed'
            const priority = notice.threatLevel === 'CRITICAL' ? 'red' : notice.threatLevel === 'WARNING' ? 'amber' : 'neutral'
            const label = isClosed ? t('ca.closed') : isFiled ? t('ca.filed') : notice.threatLevel === 'SAFE' ? t('ca.open') : t(`ca.${notice.threatLevel}`)
            const countdown = notice.daysLeft !== 999 && notice.threatLevel !== 'SAFE'
              ? notice.daysLeft <= 0 ? t('ca.overdue') : t('ca.daysLeft').replace('{count}', String(notice.daysLeft))
              : null
            return (
              <li key={notice.id}>
                <Link href={`/dashboard/notices/${notice.id}`} className="ca-notice">
                  <span className="ca-notice-icon" aria-hidden="true"><FileText size={20} /></span>
                  <div className="ca-notice-copy">
                    <p className="ca-muted">{notice.businesses?.name || t('ca.unknownClient')}</p>
                    <h3>{notice.form || notice.authority || t('ca.notice')}</h3>
                    {notice.authority && notice.form && <p className="ca-muted">{notice.authority}</p>}
                    {notice.issue && <p className="ca-subject line-clamp-2">{notice.issue}</p>}
                  </div>
                  <div className="ca-notice-meta">
                    <span className={`ca-status ca-status-${priority}`}>{label}</span>
                    <strong className="ca-money">{money(extractDemandAmount(notice))}</strong>
                    {notice.deadline && <span className="ca-muted">{t('ca.due')} {shortDate(notice.deadline, lang)}</span>}
                    {countdown && <span className={`ca-${priority}`}>{countdown}</span>}
                  </div>
                  <span className="ca-notice-action"><span className="sr-only">{t('ca.viewFile')}</span><ArrowRight size={19} aria-hidden="true" /></span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
