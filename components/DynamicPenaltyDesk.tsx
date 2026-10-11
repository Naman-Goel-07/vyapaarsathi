'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldAlert,
  Sliders,
  RotateCcw,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import { extractDemandAmount } from '@/lib/demand'

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
    <div className="bg-paper border-2 border-ink rounded-sm p-5 space-y-5 relative overflow-hidden text-ink shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-post-red text-white text-[10px] font-mono px-2 py-0.5 rounded-xs uppercase tracking-wider font-bold flex items-center gap-1">
              <ShieldAlert size={11} /> Risk Engine
            </span>
            <span className="text-xs font-mono text-gray-500 font-semibold">
              S.73 (Penalty) & Rule 88B (18% Interest)
            </span>
          </div>
          <h3 className="text-ink font-bold font-serif text-lg sm:text-xl tracking-tight">
            Fight vs. Settle Matrix
          </h3>
          <p className="text-xs text-gray-600 max-w-xl">
            Live compounding accumulation of statutory exposure. See exactly what it costs to ignore a notice.
          </p>
        </div>

        <div className="bg-red-50 border-2 border-post-red/40 px-4 py-2 rounded-sm text-right shrink-0">
          <p className="text-[10px] font-mono text-post-red uppercase font-bold tracking-wider">
            Total Money At Risk
          </p>
          <p className="text-2xl font-bold text-post-red font-mono tracking-tight">
            ₹{fightTotal.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* MATRIX: SETTLE VS FIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OPTION A: SETTLE */}
        <div className="border border-green-200 bg-green-50/30 rounded-sm p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-green-200 pb-2">
            <h4 className="font-bold text-forest-green flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Option A: Settle Early
            </h4>
            <span className="text-[10px] font-mono font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-xs">
              Within 30 Days
            </span>
          </div>
          
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Tax Demand</span>
              <span className="font-semibold text-ink">₹{displayTaxDemand.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">S.73 Concessional Penalty (25%)</span>
              <span className="font-semibold text-ink">₹{settlePenalty.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest / Late Fees</span>
              <span className="font-semibold text-forest-green">Waived</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-green-200 flex justify-between items-center">
            <span className="font-bold text-ink uppercase text-[11px] tracking-wider">Total Payable</span>
            <span className="text-lg font-bold text-forest-green font-mono">₹{settleTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* OPTION B: FIGHT & LOSE */}
        <div className="border border-red-200 bg-red-50/30 rounded-sm p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-post-red/10 rotate-45 translate-x-4 -translate-y-4"></div>
          <div className="flex justify-between items-center border-b border-red-200 pb-2">
            <h4 className="font-bold text-post-red flex items-center gap-1.5">
              <AlertTriangle size={16} /> Option B: Fight & Lose
            </h4>
            <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-xs">
              Litigation (1 Yr+)
            </span>
          </div>
          
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Tax Demand</span>
              <span className="font-semibold text-ink">₹{displayTaxDemand.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">S.73 Full Penalty (100%)</span>
              <span className="font-semibold text-post-red">₹{fightPenalty.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accumulated 18% Interest</span>
              <span className="font-semibold text-post-red">₹{fightInterest.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">S.47 Late Filing Fees</span>
              <span className="font-semibold text-post-red">₹{fightLateFee.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-red-200 flex justify-between items-center">
            <span className="font-bold text-ink uppercase text-[11px] tracking-wider">Total Exposure</span>
            <span className="text-lg font-bold text-post-red font-mono">₹{fightTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE HACKATHON SIMULATOR BAR */}
      <div className="pt-2 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-sm p-3">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="text-xs font-mono font-bold text-ink hover:text-blue-600 flex items-center gap-1.5 cursor-pointer underline underline-offset-2 transition-colors"
        >
          <Sliders size={13} />
          {showSimulator ? 'Close Daily Interest Simulator' : 'Test Daily Interest Simulator'}
        </button>

        <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-xs">
          Difference: <strong className="text-ink">₹{(fightTotal - settleTotal).toLocaleString('en-IN')} saved by settling.</strong>
        </span>
      </div>

      {showSimulator && (
        <div className="bg-white p-4 rounded-xs border-2 border-ink shadow-sm space-y-3 text-xs font-mono">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="font-bold text-ink flex items-center gap-1.5">
              <Clock size={13} className="text-blue-600" />
              Simulate Days Elapsed After Statutory Deadline:
            </span>
            <span className="text-blue-700 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              +{simulatedDays} Days Past Due
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="365"
            step="1"
            value={simulatedDays}
            onChange={(e) => setSimulatedDays(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer my-2"
          />

          <div className="flex justify-between text-[10px] text-gray-400">
            <span>T+0</span>
            <span>+30 Days</span>
            <span>+90 Days</span>
            <span>+180 Days</span>
            <span>+365 Days</span>
          </div>

          <div className="bg-blue-50/50 p-2.5 rounded border border-blue-100 text-[11px] text-gray-700 flex justify-between items-center mt-2">
            <span>
              💡 <em>Live Calculation:</em> At Day {simulatedDays}, 18% p.a. interest adds <strong>₹{Math.round(displayTaxDemand * (0.18/365) * simulatedDays).toLocaleString('en-IN')}</strong> to your exposure.
            </span>
            {simulatedDays > 0 && (
              <button
                onClick={() => setSimulatedDays(0)}
                className="text-gray-500 hover:text-ink text-[10px] font-bold flex items-center gap-1 underline shrink-0 ml-4"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
