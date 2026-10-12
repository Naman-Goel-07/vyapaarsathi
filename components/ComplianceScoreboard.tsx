'use client'

import React from 'react'
import { Award } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

export interface ComplianceScoreboardProps {
  notices?: any[]
}

export default function ComplianceScoreboard({ notices = [] }: ComplianceScoreboardProps) {
  const { t, lang } = useLanguage()
  const totalTracked = notices.length

  if (totalTracked === 0) {
    return (
      <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-forest-green text-white text-[10px] font-mono px-2 py-0.5 rounded-xs uppercase tracking-wider font-bold flex items-center gap-1">
              <Award size={11} /> {t('scoreboard.badge', 'The Scoreboard')}
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              {t('scoreboard.preview', 'Preview: based only on notices tracked in VyapaarSathi.')}
            </span>
          </div>

          <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
            {t('scoreboard.title', 'Vyapaar Compliance Health Score')}
          </h3>

          <p className="text-xs text-gray-600 max-w-xl">
            {t('scoreboard.subtitle', 'Unified statutory compliance index across GST, Municipal, and Labour authorities.')}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-sm font-mono text-gray-500 italic">
            {t('scoreboard.noNotices', 'No notices tracked yet')}
          </div>
        </div>
      </div>
    )
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
    <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-forest-green text-white text-[10px] font-mono px-2 py-0.5 rounded-xs uppercase tracking-wider font-bold flex items-center gap-1">
            <Award size={11} /> {t('scoreboard.badge', 'The Scoreboard')}
          </span>
          <span className="text-[10px] font-mono text-gray-500">
            {t('scoreboard.preview', 'Preview: based only on notices tracked in VyapaarSathi.')}
          </span>
        </div>

        <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
          {t('scoreboard.title', 'Vyapaar Compliance Health Score')}
        </h3>

        <p className="text-xs text-gray-600 max-w-xl">
          {t('scoreboard.subtitle', 'Unified statutory compliance index across GST, Municipal, and Labour authorities.')}
        </p>
      </div>

      {/* COMPLIANCE RATING & SCORE DIAL */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-4 border-forest-green flex items-center justify-center bg-forest-green/5">
            <span className="font-mono text-lg font-bold text-forest-green">{finalScore}</span>
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-ink">
              {overdueCount} {lang === 'hi' ? 'अतिदेय' : 'overdue'} · {dueThisWeekCount} {lang === 'hi' ? 'इस सप्ताह देय' : 'due this week'} · {totalTracked} {lang === 'hi' ? 'ट्रैक किए गए' : 'tracked'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
