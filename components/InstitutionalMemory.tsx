'use client'

import React, { useState } from 'react'
import {
  Brain,
  History,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Zap
} from 'lucide-react'

interface InstitutionalMemoryProps {
  form: string
  issue: string
  authority: string
}

export default function InstitutionalMemory({
  form,
  issue,
  authority
}: InstitutionalMemoryProps) {
  const [applied, setApplied] = useState(false)

  return (
    <div className="bg-slate-900 text-white border-2 border-slate-800 rounded-sm p-5 my-4 space-y-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-full bg-blue-500/10 blur-2xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-1">
              <Brain size={11} /> Institutional Memory Engine
            </span>
            <span className="font-mono text-xs text-blue-300">
              SLIDE 4 & 8 · PGVECTOR PRECEDENT RECALL
            </span>
          </div>

          <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <History size={16} className="text-blue-400" />
            Remembers How the Last Case Was Closed
          </h4>
        </div>

        <div className="flex items-center gap-1.5 bg-blue-950 border border-blue-800 px-2.5 py-1 rounded text-xs font-mono text-blue-200">
          <Sparkles size={12} className="text-amber-400" />
          <span>Semantic Match: <strong>96% Similarity</strong></span>
        </div>
      </div>

      {/* MATCHED HISTORICAL PRECEDENT CARD */}
      <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-start text-[11px] text-gray-400 border-b border-slate-800 pb-2">
          <span>PRIOR CASE: DOCKET #VS-2025-0814 (M/s RK Enterprises)</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> 100% Demand Dropped
          </span>
        </div>

        <div className="space-y-1 font-sans text-xs">
          <p className="text-gray-300">
            <strong>Matched Issue:</strong> Similar GSTR-2B vs GSTR-3B ITC discrepancy of ₹1,85,000 before {authority}.
          </p>
          <p className="text-gray-300">
            <strong>Winning Defense Strategy:</strong> Rebuttal drafted under <em>Rule 99(2)</em> invoking <em>CBIC Circular No. 183/15/2022-GST</em> + Chartered Accountant certificate for supplier compliance.
          </p>
          <p className="text-emerald-300 font-mono text-[11px] pt-1">
            Outcome: Closed in 4 days by Proper Officer with ₹0 penalty and ₹0 interest.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
          <span className="text-[10px] text-gray-400">
            Embedding Vector: [0.082, -0.412, 0.912... 768-dim]
          </span>

          <button
            onClick={() => setApplied(true)}
            disabled={applied}
            className={`px-3 py-1.5 rounded-xs font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              applied
                ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {applied ? (
              <>
                <CheckCircle2 size={13} /> Precedent Injected into ASMT-11
              </>
            ) : (
              <>
                <Zap size={13} /> Apply Precedent to Current Draft
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
