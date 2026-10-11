'use client'

import React from 'react'
import Link from 'next/link'
import { Brain, History, ExternalLink } from 'lucide-react'

export interface PastNoticePrecedent {
  id: string
  form: string
  issue: string
  deadline?: string | null
  status: string
  created_at?: string
}

interface InstitutionalMemoryProps {
  pastNotices?: PastNoticePrecedent[]
}

export default function InstitutionalMemory({
  pastNotices = []
}: InstitutionalMemoryProps) {
  return (
    <div className="bg-slate-900 text-white border-2 border-slate-800 rounded-sm p-5 my-4 space-y-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-full bg-blue-500/10 blur-2xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-1">
              <Brain size={11} /> Institutional Memory Engine
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              Preview: based on filed or closed cases for this business
            </span>
          </div>

          <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <History size={16} className="text-blue-400" />
            Earlier Closed &amp; Filed Cases
          </h4>
        </div>
      </div>

      {pastNotices.length === 0 ? (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded font-mono text-xs text-gray-400">
          No earlier notices of this type for this business yet.
        </div>
      ) : (
        <div className="space-y-3">
          {pastNotices.map((n) => {
            const truncatedIssue = (n.issue || '').length > 120
              ? `${(n.issue || '').slice(0, 120)}...`
              : (n.issue || '')

            return (
              <div
                key={n.id}
                className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-2 font-mono text-xs"
              >
                <div className="flex justify-between items-start text-[11px] text-gray-400 border-b border-slate-800 pb-2">
                  <span className="text-white font-bold">{n.form}</span>
                  <span className="text-emerald-400 uppercase font-semibold">Status: {n.status}</span>
                </div>
                <p className="text-gray-300 font-sans text-xs">{truncatedIssue}</p>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">
                    Deadline: {n.deadline || 'No deadline'}
                  </span>
                  <Link
                    href={`/dashboard/notices/${n.id}`}
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-mono font-bold"
                  >
                    View Case File <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
