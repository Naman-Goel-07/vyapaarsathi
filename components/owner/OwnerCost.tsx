'use client'
import { useState } from 'react'
import { extractDemandAmount, extractDIN } from '@/lib/demand'
import { useLanguage } from '@/lib/context/LanguageContext'
import { money } from '@/lib/owner-ui'
export default function OwnerCost({ notice }: { notice: any }) {
  const { t } = useLanguage()
  const [simulatedDays, setSimulatedDays] = useState(0)
  const notices = [notice]
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


  return <section className="owner-card space-y-4"><h2 className="text-xl font-bold">{t('owner.cost')}</h2><p className="text-slate-600">{t('owner.costHint')}</p>{hasExposure ? <div className="grid sm:grid-cols-2 gap-3"><div className="rounded-xl bg-blue-50 p-4"><h3>{t('owner.settle')}</h3><p className="text-2xl font-bold mt-2">{money(settleTotal)}</p></div><div className="rounded-xl border p-4"><h3>{t('owner.fight')}</h3><p className="text-2xl font-bold mt-2">{money(fightTotal)}</p></div></div> : <p>{t('owner.noCost')}</p>}
    <details className="border-t pt-3"><summary>{t('owner.breakdown')}</summary><div className="space-y-5 mt-4"><dl className="space-y-3"><div><dt className="text-slate-500">{t('owner.noticeType')}</dt><dd>{notice.form}</dd></div><div><dt className="text-slate-500">{t('owner.reference')}</dt><dd className="break-all">{extractDIN(notice) || notice.id}</dd></div></dl><p className="text-slate-600">{t('owner.rule')}</p><dl className="space-y-3">{[{ key: 'tax', value: displayTaxDemand }, { key: 'settlePenalty', value: settlePenalty }, { key: 'fightPenalty', value: fightPenalty }, { key: 'interest', value: fightInterest }, { key: 'lateFee', value: fightLateFee }].map(({ key, value }) => <div className="flex justify-between gap-4" key={key}><dt>{t(`owner.${key}`)}</dt><dd className="font-semibold shrink-0">{money(value)}</dd></div>)}</dl><p>{t('owner.waived')}</p><div className="rounded-xl bg-slate-50 p-4 space-y-3"><h3 className="font-bold">{t('owner.simulator')}</h3><label htmlFor="delay-days">{t('owner.extraDays').replace('{count}', String(simulatedDays))}</label><input id="delay-days" type="range" min="0" max="365" step="1" value={simulatedDays} onChange={e => setSimulatedDays(Number(e.target.value))} className="w-full min-h-12 accent-blue-700" /><div aria-live="polite"><p>{t('owner.addedInterest')}: <strong>{money(Math.round(displayTaxDemand * (0.18/365) * simulatedDays))}</strong></p><p>{t('owner.currentInterest')}: {money(totalInterest)}</p><p>{t('owner.currentFees')}: {money(totalLateFees)}</p></div><button className="owner-secondary" onClick={() => setSimulatedDays(0)}>{t('owner.reset')}</button></div></div></details>
  </section>
}
