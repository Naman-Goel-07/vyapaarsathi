'use client'

import React from 'react'
import { useLanguage } from '@/lib/context/LanguageContext'

export interface ComplianceScoreboardProps {
  notices?: any[]
}

export default function ComplianceScoreboard({ notices = [] }: ComplianceScoreboardProps) {
  const { t } = useLanguage()
  const totalTracked = notices.length

  if (totalTracked === 0) {
    return <section className="ca-score ca-score-empty" aria-label={t('ca.score')}>
      <strong>{t('ca.score')}</strong><span className="ca-muted">{t('ca.noScore')}</span>
    </section>
  }

  // Current date in Asia/Kolkata (YYYY-MM-DD)
  const now = new Date()
  const istDateString = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const todayIST = new Date(`${istDateString}T00:00:00+05:30`)

  let overdueCount = 0
  let dueThisWeekCount = 0
  let computedScore = 100

  notices.forEach((n) => {
    const isOpen = n.status !== 'closed' && n.status !== 'filed'
    if (!isOpen || !n.deadline) return

    const deadlineStr = String(n.deadline).split('T')[0]
    const deadlineDate = new Date(`${deadlineStr}T00:00:00+05:30`)
    const diffDays = Math.round((deadlineDate.getTime() - todayIST.getTime()) / (1000 * 60 * 60 * 24))

    // A deadline is overdue only after that day ends in IST
    if (diffDays < 0) {
      overdueCount++
      computedScore -= 15
    } else if (diffDays <= 7) {
      dueThisWeekCount++
      computedScore -= 5
    }
  })

  const finalScore = Math.max(0, computedScore)

  return (
    <section aria-label={t('ca.score')}>
      <dl className="ca-score">
        <div><dt>{t('ca.score')}</dt><dd>{finalScore}<small>/100</small></dd></div>
        <div><dt>{t('ca.overdue')}</dt><dd className={overdueCount ? 'ca-red' : undefined}>{overdueCount}</dd></div>
        <div><dt>{t('ca.dueWeek')}</dt><dd className={dueThisWeekCount ? 'ca-amber' : undefined}>{dueThisWeekCount}</dd></div>
        <div><dt>{t('ca.tracked')}</dt><dd>{totalTracked}</dd></div>
      </dl>
      <p className="ca-muted ca-score-note">{t('ca.scoreHint')}</p>
    </section>
  )
}
