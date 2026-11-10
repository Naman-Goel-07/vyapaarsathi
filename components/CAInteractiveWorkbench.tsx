'use client'

import React, { useState } from 'react'
import CAClientPortfolio, { ClientBusinessSummary } from '@/components/CAClientPortfolio'
import DynamicPenaltyDesk from '@/components/DynamicPenaltyDesk'
import CATriageHeatmap from '@/components/CATriageHeatmap'
import { Calculator, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { extractDemandAmount } from '@/lib/demand'

interface NoticeItem {
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
  business_id?: string
  businesses?: { id?: string; name: string } | null
}

interface BusinessItem {
  id: string
  name: string
  created_at?: string
}

interface CAInteractiveWorkbenchProps {
  initialNotices: NoticeItem[]
  initialBusinesses: BusinessItem[]
}

export default function CAInteractiveWorkbench({
  initialNotices = [],
  initialBusinesses = []
}: CAInteractiveWorkbenchProps) {
  const { t } = useLanguage()
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)

  // Map known businesses or synthesize client portfolio from notices
  const businessMap = new Map<string, ClientBusinessSummary>()

  // First populate strictly from database businesses
  initialBusinesses.forEach((b) => {
    businessMap.set(b.id, {
      id: b.id,
      name: b.name || 'Unnamed Enterprise',
      activeNoticesCount: 0,
      totalRisk: 0,
      hasCritical: false
    })
  })

  // Aggregate stats from actual notices in database
  initialNotices.forEach((n) => {
    const bizId = n.business_id || (n.businesses as any)?.id
    const bizName = (n.businesses as any)?.name || 'Enterprise'

    if (bizId) {
      if (!businessMap.has(bizId)) {
        businessMap.set(bizId, {
          id: bizId,
          name: bizName,
          activeNoticesCount: 0,
          totalRisk: 0,
          hasCritical: false
        })
      }

      const current = businessMap.get(bizId)!
      if (n.status !== 'closed' && n.status !== 'filed') {
        current.activeNoticesCount += 1
        current.totalRisk += extractDemandAmount(n)
      }
    }
  })

  const clientSummaries = Array.from(businessMap.values())

  // Filter notices based on selected business
  const filteredNotices = selectedBusinessId
    ? initialNotices.filter((n) => {
        const bId = n.business_id || (n.businesses as any)?.id
        return bId === selectedBusinessId
      })
    : initialNotices

  return (
    <div className="ca-workbench">
      <CAClientPortfolio
        businesses={clientSummaries}
        selectedBusinessId={selectedBusinessId}
        onSelectBusiness={setSelectedBusinessId}
      />
      <div className="ca-workbench-main">
        <details className="ca-panel ca-disclosure">
          <summary>
            <Calculator size={21} aria-hidden="true" />
            <span><strong>{t('ca.exposure')}</strong><small>{t('ca.exposureHint')}</small></span>
            <ChevronDown size={19} className="ca-disclosure-arrow" aria-hidden="true" />
          </summary>
          <DynamicPenaltyDesk notices={filteredNotices} />
        </details>
        <CATriageHeatmap notices={filteredNotices} selectedBusinessId={selectedBusinessId} />
      </div>
    </div>
  )
}
