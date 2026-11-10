'use client'

import React, { useState } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { extractDemandAmount, formatDemandDisplay as money } from '@/lib/demand'
import { useLanguage } from '@/lib/context/LanguageContext'

interface DynamicPenaltyDeskProps {
  notices: Array<{
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
  }>
}

export default function DynamicPenaltyDesk({ notices = [] }: DynamicPenaltyDeskProps) {
  const { t } = useLanguage()
  const [simulatedDays, setSimulatedDays] = useState(0)
  const [showSimulator, setShowSimulator] = useState(false)

  const today = new Date()

  // Calculate actual overdue and at-risk notices
  let overdueCount = 0
  let totalTaxDemand = 0
  let totalLateFees = 0
  let totalInterest = 0

  notices.forEach(notice => {
    if (notice.status !== 'closed' && notice.status !== 'filed') {
      const demand = extractDemandAmount(notice)
      totalTaxDemand += demand

      if (notice.deadline) {
        const deadlineDate = new Date(notice.deadline)
        const diffMs = today.getTime() - deadlineDate.getTime()
        const actualDaysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
        const effectiveDaysOverdue = actualDaysOverdue + simulatedDays

        if (effectiveDaysOverdue > 0) {
          overdueCount++
          // S.47 CGST Act: Rs 50/day late fee capped at Rs 2,000 for turnover < 1.5 Cr
          const lateFee = Math.min(2000, effectiveDaysOverdue * 50)
          totalLateFees += lateFee

          // Rule 88B: 18% p.a. interest on delayed tax discharge
          const dailyInterestRate = 0.18 / 365
          const interest = Math.round(demand * dailyInterestRate * effectiveDaysOverdue)
          totalInterest += interest
        }
      }
    }
  })

  // Real database metrics
  const displayOverdueCount = overdueCount
  const displayTaxDemand = totalTaxDemand
  const displayLateFees = totalLateFees
  
  // Fight vs Settle Logic (strictly dynamic based on database notices)
  const hasExposure = displayTaxDemand > 0 || overdueCount > 0

  // Option A: Settle within 30 days (Sec 73: Tax + 25% Penalty)
  const settlePenalty = hasExposure ? Math.round(displayTaxDemand * 0.25) : 0
  const settleTotal = hasExposure ? (displayTaxDemand + settlePenalty) : 0
  
  // Option B: Fight and Lose after 1 Year (Tax + 100% Penalty + 18% Interest + Late Fees)
  const fightPenalty = hasExposure ? displayTaxDemand : 0 // 100% penalty
  const fightInterest = hasExposure ? Math.round(displayTaxDemand * 0.18) : 0 // 1 year 18% p.a.
  const fightLateFee = hasExposure ? Math.max(2000, displayLateFees) : 0
  const fightTotal = hasExposure ? (displayTaxDemand + fightPenalty + fightInterest + fightLateFee) : 0

  return (
    <div className="ca-exposure-body">
      <div className="ca-exposure-overview">
        <span className="ca-muted">{t('ca.estimate')}</span>
        <div><span>{t('ca.totalRisk')}</span><strong>{money(fightTotal)}</strong></div>
      </div>
      <div className="ca-scenarios">
        {[
          {
            key: 'settle', period: 'settlePeriod', total: settleTotal,
            lines: [['tax', money(displayTaxDemand)], ['reducedPenalty', money(settlePenalty)], ['interestAndFees', t('ca.waived')]],
          },
          {
            key: 'fight', period: 'fightPeriod', total: fightTotal,
            lines: [['tax', money(displayTaxDemand)], ['fullPenalty', money(fightPenalty)], ['interest', money(fightInterest)], ['fees', money(fightLateFee)]],
          },
        ].map(scenario => (
          <section key={scenario.key} className="ca-scenario">
            <h3>{t(`ca.${scenario.key}`)}</h3>
            <p className="ca-muted">{t(`ca.${scenario.period}`)}</p>
            <dl>
              {scenario.lines.map(([label, value]) => <div key={label}><dt>{t(`ca.${label}`)}</dt><dd>{value}</dd></div>)}
              <div className="ca-scenario-total"><dt>{t('ca.total')}</dt><dd>{money(scenario.total)}</dd></div>
            </dl>
          </section>
        ))}
      </div>

      <div className="ca-simulator-tools">
        <button type="button" className="ca-header-action" onClick={() => setShowSimulator(!showSimulator)} aria-expanded={showSimulator} aria-controls="ca-interest-controls">
          <SlidersHorizontal size={17} aria-hidden="true" /> {t('ca.simulator')}
        </button>
        <p className="ca-muted">{t('ca.difference')}: <strong>{money(fightTotal - settleTotal)}</strong></p>
      </div>
      {showSimulator && (
        <div className="ca-simulator" id="ca-interest-controls">
          <label htmlFor="ca-interest-days">{t('ca.daysPastDue')} <strong>{t('ca.days').replace('{count}', String(simulatedDays))}</strong></label>
          <input id="ca-interest-days" type="range" min="0" max="365" step="1" value={simulatedDays}
            onChange={(e) => setSimulatedDays(Number(e.target.value))} />
          <div className="ca-range-ticks" aria-hidden="true"><span>0</span><span>30</span><span>90</span><span>180</span><span>365</span></div>
          <div className="ca-simulator-tools">
            <p>{t('ca.addedInterest')}: <strong>{money(Math.round(displayTaxDemand * (0.18/365) * simulatedDays))}</strong></p>
            {simulatedDays > 0 && <button type="button" className="ca-header-action" onClick={() => setSimulatedDays(0)}><RotateCcw size={17} aria-hidden="true" /> {t('ca.reset')}</button>}
          </div>
        </div>
      )}
    </div>
  )
}
