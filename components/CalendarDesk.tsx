'use client'

import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  Send,
  MessageSquare,
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface CalendarDeskProps {
  deadline?: string | null
  noticeId: string
  createdAt?: string | null
  businessName?: string
}

function getISTStatus(targetDate: Date): 'Upcoming' | 'Date passed' {
  const now = new Date()
  const todayIST = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const targetIST = targetDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  return targetIST < todayIST ? 'Date passed' : 'Upcoming'
}

function formatDateIST(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function CalendarDesk({
  deadline,
  noticeId,
  createdAt,
  businessName = 'Registered MSME'
}: CalendarDeskProps) {
  const [testChasing, setTestChasing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSimulateChase = () => {
    setTestChasing(true)
    setTimeout(() => {
      setTestChasing(false)
      setToastMessage(
        `Preview only: reminders are not sent yet. Automated alert to ${businessName}: Statutory filing deadline approaching. Please check pending evidentiary documents.`
      )
      setTimeout(() => setToastMessage(null), 6000)
    }, 800)
  }

  const createdDate = createdAt ? new Date(createdAt) : new Date()
  const day2Date = new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000)
  const day5Date = new Date(createdDate.getTime() + 5 * 24 * 60 * 60 * 1000)

  let finalReminderDate: Date | null = null
  if (deadline) {
    const deadlineDate = new Date(deadline)
    finalReminderDate = new Date(deadlineDate.getTime() - 48 * 60 * 60 * 1000)
  }

  const stages = [
    {
      label: 'T+0 (INTAKE)',
      date: createdDate,
      title: 'Notice Ingested',
      description: 'File opened.'
    },
    {
      label: 'DAY 2 REMINDER',
      date: day2Date,
      title: 'CA Reminder',
      description: 'Verification reminder scheduled for CA Bench.'
    },
    {
      label: 'DAY 5 ESCALATION',
      date: day5Date,
      title: 'Owner Escalation',
      description: 'Alert scheduled if evidentiary records remain pending.'
    },
    ...(finalReminderDate
      ? [
          {
            label: '48H BEFORE DEADLINE',
            date: finalReminderDate,
            title: 'Final Filing Window',
            description: 'Final reminder prior to statutory deadline closure.'
          }
        ]
      : [])
  ]

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-5 my-4 space-y-4 shadow-xs text-ink relative">
      {/* TOAST PREVIEW BANNER */}
      {toastMessage && (
        <div className="bg-slate-900 text-white p-3 rounded-xs text-xs font-mono flex items-center justify-between border-l-4 border-amber-400 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-200 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} /> The Calendar Desk
            </span>
            <span className="font-mono text-xs text-gray-500">
              Preview: escalation schedule based on notice intake date
            </span>
          </div>
          <h4 className="text-base font-serif font-bold text-ink flex items-center gap-2">
            <Clock size={16} className="text-slate-700" />
            Statutory Reminder &amp; Escalation Schedule
          </h4>
        </div>

        <button
          onClick={handleSimulateChase}
          disabled={testChasing}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold rounded-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {testChasing ? (
            <>
              <Loader2 className="animate-spin" size={13} /> Loading...
            </>
          ) : (
            <>
              <Send size={13} /> Preview reminder message
            </>
          )}
        </button>
      </div>

      {!deadline ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-900 font-mono text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <span>No deadline recorded, so reminders can&apos;t be scheduled.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          {stages.map((stage, idx) => {
            const status = getISTStatus(stage.date)
            return (
              <div key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-500 uppercase">{stage.label}</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      status === 'Date passed'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="font-bold text-ink">{stage.title}</p>
                <p className="text-[10px] text-gray-500">{formatDateIST(stage.date)}</p>
                <p className="text-[11px] text-gray-600 font-sans">{stage.description}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
