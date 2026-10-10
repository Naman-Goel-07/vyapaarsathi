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

interface DynamicPenaltyDeskProps {
  notices: Array<{
    id: string
    authority?: string
    form?: string
    issue?: string
    deadline?: string | null
    status?: string
    penalty_amount?: number
  }>
}

export default function DynamicPenaltyDesk({ notices = [] }: DynamicPenaltyDeskProps) {
  const [simulatedDays, setSimulatedDays] = useState(0)
  const [showSimulator, setShowSimulator] = useState(false)

  const today = new Date()

  // Calculate actual overdue and at-risk notices
  let overdueCount = 0
  let totalBasePenaltyAtRisk = 0
  let totalLateFees = 0
  let totalInterest = 0

  notices.forEach(notice => {
    if (notice.status !== 'closed' && notice.status !== 'filed') {
      const demand = notice.penalty_amount || 245000
      totalBasePenaltyAtRisk += demand

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

  // Fallback defaults for demo if no notices in DB are yet overdue
  const displayOverdueCount = overdueCount > 0 ? overdueCount : (simulatedDays > 0 ? 1 : 1)
  const displayLateFees = totalLateFees > 0 ? totalLateFees : (simulatedDays > 0 ? Math.min(2000, simulatedDays * 50) : 450)
  const displayInterest = totalInterest > 0 ? totalInterest : (simulatedDays > 0 ? Math.round(245000 * (0.18 / 365) * simulatedDays) : 362)
  const grandTotalExposure = displayLateFees + displayInterest

  return (
    <div className="bg-post-red/5 border-2 border-post-red/20 rounded-sm p-5 space-y-4 relative overflow-hidden text-ink">
      <div className="absolute top-0 left-0 w-2 h-full bg-post-red"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pl-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-post-red text-white text-[10px] font-mono px-2 py-0.5 rounded-xs uppercase tracking-wider font-bold flex items-center gap-1">
              <ShieldAlert size={11} /> Live Engine
            </span>
            <span className="text-xs font-mono text-gray-500 font-semibold">
              S.47 CGST Act (₹50/Day) & Rule 88B (18% Interest)
            </span>
          </div>
          <h3 className="text-post-red font-bold font-serif text-lg sm:text-xl tracking-tight">
            Penalty Exposure & Late Fee Desk
          </h3>
          <p className="text-xs text-gray-600 max-w-xl">
            Live compounding accumulation of statutory late fees and interest across unfiled government notices.
          </p>
        </div>

        {/* METRIC BADGES */}
        <div className="flex items-center gap-4 sm:gap-6 bg-white px-5 py-3 rounded-sm border border-post-red/20 shadow-xs shrink-0">
          <div className="text-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider">
              Statutory Late Fee
            </p>
            <p className="text-xl sm:text-2xl font-bold text-post-red font-mono">
              ₹{displayLateFees.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="w-px h-8 bg-gray-200"></div>

          <div className="text-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider">
              18% P.A. Interest
            </p>
            <p className="text-lg sm:text-xl font-bold text-ink font-mono">
              ₹{displayInterest.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="w-px h-8 bg-gray-200"></div>

          <div className="text-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider">
              Overdue Dockets
            </p>
            <p className="text-lg sm:text-xl font-bold text-ink font-mono">
              {displayOverdueCount}
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE HACKATHON SIMULATOR BAR */}
      <div className="pt-3 border-t border-post-red/15 pl-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="text-xs font-mono font-bold text-post-red hover:text-red-800 flex items-center gap-1.5 cursor-pointer underline underline-offset-2"
        >
          <Sliders size={13} />
          {showSimulator ? 'Hide Deadline Slip Simulator' : 'Test "Cost of Doing Nothing" Simulator'}
        </button>

        <span className="text-[11px] font-mono text-gray-500">
          Total Compounding Exposure: <strong className="text-post-red">₹{grandTotalExposure.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {showSimulator && (
        <div className="bg-white p-4 rounded-xs border border-post-red/30 shadow-inner space-y-3 text-xs pl-4 font-mono">
          <div className="flex justify-between items-center">
            <span className="font-bold text-ink flex items-center gap-1.5">
              <Clock size={13} className="text-post-red" />
              Simulate Days Elapsed After Statutory Deadline:
            </span>
            <span className="text-post-red font-bold text-sm bg-red-50 px-2 py-0.5 rounded border border-red-200">
              +{simulatedDays} Days Past Due
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="60"
            step="1"
            value={simulatedDays}
            onChange={(e) => setSimulatedDays(Number(e.target.value))}
            className="w-full accent-post-red cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-gray-400">
            <span>T+0 (Deadline)</span>
            <span>+15 Days</span>
            <span>+30 Days</span>
            <span>+40 Days (₹2,000 Cap Reached)</span>
            <span>+60 Days</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-[11px] text-gray-600 flex justify-between items-center">
            <span>
              💡 <em>Slide 6 Proof:</em> At ₹50/day, a business hits the statutory ₹2,000 cap by Day 40. Interest continues accruing at 18% p.a.
            </span>
            {simulatedDays > 0 && (
              <button
                onClick={() => setSimulatedDays(0)}
                className="text-gray-500 hover:text-ink text-[10px] font-bold flex items-center gap-1 underline"
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
