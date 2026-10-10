'use client'

import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  Send,
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  PhoneCall,
  Loader2
} from 'lucide-react'

interface CalendarDeskProps {
  deadline?: string | null
  noticeId: string
  businessName?: string
}

export default function CalendarDesk({
  deadline,
  noticeId,
  businessName = 'Registered MSME'
}: CalendarDeskProps) {
  const [testChasing, setTestChasing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSimulateChase = () => {
    setTestChasing(true)
    setTimeout(() => {
      setTestChasing(false)
      setToastMessage(
        `[DAY 5 ESCALATION TRIGGERED] Automated WhatsApp & SMS alert dispatched to ${businessName}: "Statutory filing deadline in 48 hrs. Missing: Sales Invoices. Tap to upload."`
      )
      setTimeout(() => setToastMessage(null), 6000)
    }, 1000)
  }

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-5 my-4 space-y-4 shadow-xs text-ink relative">
      {/* TOAST SIMULATION BANNER */}
      {toastMessage && (
        <div className="bg-slate-900 text-white p-3 rounded-xs text-xs font-mono flex items-center justify-between border-l-4 border-amber-400 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white text-xs ml-2"
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
            <span className="font-mono text-xs text-gray-500 font-semibold">
              Slide 3 & 7 · PG_CRON DEADLINE ENGINE
            </span>
          </div>
          <h4 className="text-base font-serif font-bold text-ink flex items-center gap-2">
            <Clock size={16} className="text-slate-700" />
            Automated Escalation & Chase Ledger (Zero Follow-up Calls)
          </h4>
        </div>

        <button
          onClick={handleSimulateChase}
          disabled={testChasing}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold rounded-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {testChasing ? (
            <>
              <Loader2 className="animate-spin" size={13} /> Chasing...
            </>
          ) : (
            <>
              <Send size={13} /> Trigger Live Test Chase
            </>
          )}
        </button>
      </div>

      {/* 4-STAGE TIMELINE OF AUTOMATED CHASES */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
        {/* T0 */}
        <div className="bg-gray-50 border border-gray-200 p-3 rounded space-y-1">
          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span>T+0 SECONDS</span>
            <span className="text-forest-green font-bold flex items-center gap-0.5">
              <CheckCircle2 size={11} /> Executed
            </span>
          </div>
          <p className="font-bold text-ink">Notice Ingested</p>
          <p className="text-[11px] text-gray-500 font-sans">
            File opened, 5 statutory tasks generated and assigned.
          </p>
        </div>

        {/* DAY 2 */}
        <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded space-y-1">
          <div className="flex justify-between items-center text-[10px] text-emerald-800">
            <span>DAY 2</span>
            <span className="text-forest-green font-bold flex items-center gap-0.5">
              <CheckCircle2 size={11} /> Dispatched
            </span>
          </div>
          <p className="font-bold text-ink">CA WhatsApp Reminder</p>
          <p className="text-[11px] text-gray-600 font-sans">
            Automated ping to CA Bench requesting invoice verification.
          </p>
        </div>

        {/* DAY 5 */}
        <div className="bg-amber-50/60 border border-amber-200 p-3 rounded space-y-1">
          <div className="flex justify-between items-center text-[10px] text-amber-800">
            <span>DAY 5</span>
            <span className="text-amber-800 font-bold flex items-center gap-0.5">
              <AlertTriangle size={11} /> Escalation Point
            </span>
          </div>
          <p className="font-bold text-ink">Escalates to Owner</p>
          <p className="text-[11px] text-gray-600 font-sans">
            Automated SMS & voice dispatch if documents remain unuploaded.
          </p>
        </div>

        {/* DAY 7 */}
        <div className="bg-red-50/40 border border-red-200 p-3 rounded space-y-1">
          <div className="flex justify-between items-center text-[10px] text-post-red">
            <span>DAY 7 (48h TO SLIP)</span>
            <span className="text-post-red font-bold">Hard Lock</span>
          </div>
          <p className="font-bold text-ink">Final Filing Sprint</p>
          <p className="text-[11px] text-gray-600 font-sans">
            Auto-prefills Form GST ASMT-11 for CA signature before penalty triggers.
          </p>
        </div>
      </div>
    </div>
  )
}
