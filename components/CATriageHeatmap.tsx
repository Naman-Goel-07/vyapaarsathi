'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Clock, ShieldCheck, Filter } from 'lucide-react'

type Notice = {
  id: string
  authority?: string
  form?: string
  issue?: string
  deadline?: string | null
  status?: string
  penalty_amount?: number
  business_id?: string
  businesses?: { id?: string; name: string } | null
}

export default function CATriageHeatmap({
  notices,
  selectedBusinessId
}: {
  notices: Notice[]
  selectedBusinessId?: string | null
}) {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SAFE'>('ALL')
  
  const today = new Date()

  // Filter by selected business if specified
  const scopedNotices = selectedBusinessId
    ? notices.filter(n => n.business_id === selectedBusinessId || (n.businesses as any)?.id === selectedBusinessId)
    : notices

  // Decorate notices with threat levels
  const decoratedNotices = scopedNotices.map(notice => {
    let threatLevel: 'CRITICAL' | 'WARNING' | 'SAFE' = 'SAFE'
    let threatScore = 0
    let daysLeft = 999

    if (notice.status !== 'closed' && notice.status !== 'filed' && notice.deadline) {
      const deadlineDate = new Date(notice.deadline)
      const diffMs = deadlineDate.getTime() - today.getTime()
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

      if (daysLeft <= 3) threatLevel = 'CRITICAL'
      else if (daysLeft <= 7) threatLevel = 'WARNING'
      
      const penalty = notice.penalty_amount || 50000
      // Higher score is worse. If overdue, make score massively high.
      threatScore = daysLeft <= 0 ? penalty * 100 : penalty / daysLeft
    } else if (notice.status === 'filed' || notice.status === 'closed') {
      threatLevel = 'SAFE'
      threatScore = -1
    }

    return { ...notice, threatLevel, threatScore, daysLeft }
  })

  // Sort descending by threat score
  decoratedNotices.sort((a, b) => b.threatScore - a.threatScore)

  const filteredNotices = decoratedNotices.filter(n => filter === 'ALL' || n.threatLevel === filter)

  const criticalCount = decoratedNotices.filter(n => n.threatLevel === 'CRITICAL').length
  const warningCount = decoratedNotices.filter(n => n.threatLevel === 'WARNING').length
  const safeCount = decoratedNotices.filter(n => n.threatLevel === 'SAFE').length

  return (
    <div className="space-y-4">
      {/* TRIAGE CONTROLS */}
      <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="font-mono text-sm font-bold text-ink uppercase tracking-wider">Triage Filters:</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-sm border transition-colors ${filter === 'ALL' ? 'bg-ink text-white border-ink' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          >
            ALL ({notices.length})
          </button>
          <button 
            onClick={() => setFilter('CRITICAL')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-sm border transition-colors ${filter === 'CRITICAL' ? 'bg-post-red text-white border-post-red' : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'}`}
          >
            CRITICAL ({criticalCount})
          </button>
          <button 
            onClick={() => setFilter('WARNING')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-sm border transition-colors ${filter === 'WARNING' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'}`}
          >
            WARNING ({warningCount})
          </button>
          <button 
            onClick={() => setFilter('SAFE')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-sm border transition-colors ${filter === 'SAFE' ? 'bg-forest-green text-white border-forest-green' : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'}`}
          >
            SAFE/FILED ({safeCount})
          </button>
        </div>
      </div>

      {/* HEATMAP GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full border border-dashed border-gray-300 rounded-sm p-12 text-center bg-gray-50">
             <p className="text-gray-500 font-medium">No notices match this threat level.</p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isCritical = notice.threatLevel === 'CRITICAL'
            const isWarning = notice.threatLevel === 'WARNING'
            
            // Visual mapping based on threat
            const borderColor = isCritical ? 'border-post-red' : isWarning ? 'border-amber-400' : 'border-gray-200'
            const headerBg = isCritical ? 'bg-post-red text-white' : isWarning ? 'bg-amber-400 text-ink' : 'bg-gray-50 text-ink'
            
            return (
              <div key={notice.id} className={`bg-white rounded-sm shadow-sm border-2 ${borderColor} flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow`}>
                
                {/* Heatmap Header */}
                <div className={`${headerBg} px-4 py-2 flex justify-between items-center border-b ${borderColor}`}>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {isCritical && <AlertTriangle size={12} />}
                    {isWarning && <Clock size={12} />}
                    {notice.threatLevel === 'SAFE' && <ShieldCheck size={12} />}
                    {notice.threatLevel}
                  </span>
                  {notice.daysLeft !== 999 && notice.threatLevel !== 'SAFE' && (
                    <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-sm">
                      {notice.daysLeft <= 0 ? 'OVERDUE' : `${notice.daysLeft} DAYS LEFT`}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-4 flex-1">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-gray-500">
                      {(notice.businesses as any)?.name?.toUpperCase() || 'UNKNOWN CLIENT'}
                    </span>
                    <span className="font-mono text-xs font-bold text-ink bg-gray-100 px-2 py-0.5 rounded-sm">
                      ₹{((notice.penalty_amount || 0) / 1000).toFixed(1)}k RISK
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Authority / Dept</p>
                    <h3 className="font-mono text-sm font-semibold text-ink line-clamp-1">{notice.authority}</h3>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Subject</p>
                    <p className="text-sm font-medium line-clamp-2 leading-relaxed">{notice.issue}</p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link 
                    href={`/dashboard/notices/${notice.id}`} 
                    className={`block w-full text-center py-2 text-xs font-bold font-mono tracking-wider rounded-sm transition-colors ${
                      isCritical ? 'bg-red-50 text-post-red hover:bg-post-red hover:text-white' :
                      isWarning ? 'bg-amber-50 text-amber-800 hover:bg-amber-400 hover:text-ink' :
                      'bg-gray-100 text-ink hover:bg-ink hover:text-white'
                    }`}
                  >
                    ACCESS CASE FILE
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
