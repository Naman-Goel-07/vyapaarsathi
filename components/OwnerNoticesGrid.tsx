'use client'

import React from 'react'
import Link from 'next/link'
import UploadNotice from '@/components/UploadNotice'
import { extractDemandAmount } from '@/lib/demand'
import { useLanguage } from '@/lib/context/LanguageContext'

interface OwnerNoticesGridProps {
  notices: any[]
  businessId: string
}

export default function OwnerNoticesGrid({ notices, businessId }: OwnerNoticesGridProps) {
  const { t, lang } = useLanguage()

  const getStatusBadge = (status: string) => {
    if (status === 'open') {
      return {
        label: t('badges.actionReq', 'ACTION REQ'),
        className: 'bg-yellow-50 text-yellow-800 border-yellow-200'
      }
    }
    if (status === 'filed') {
      return {
        label: t('badges.filed', 'FILED'),
        className: 'bg-forest-green/10 text-forest-green border-forest-green/20'
      }
    }
    if (status === 'closed') {
      return {
        label: t('badges.closed', 'CLOSED'),
        className: 'bg-gray-50 text-gray-800 border-gray-200'
      }
    }
    return {
      label: status?.toUpperCase() || '',
      className: 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-300 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-ink"></div>
        <div className="pl-4">
          <h2 className="text-2xl font-bold font-serif tracking-tight">
            {t('ownerDashboard.incomingDispatches', 'Incoming Dispatches')}
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            {t('ownerDashboard.incomingSub', 'Upload notices for AI extraction and task delegation.')}
          </p>
        </div>
        <UploadNotice businessId={businessId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notices.length === 0 ? (
          <div className="col-span-full border border-dashed border-gray-300 rounded-sm p-12 text-center bg-gray-50">
            <p className="text-gray-500 font-medium">
              {t('ownerDashboard.noNoticesTitle', 'No notices currently logged in the registry.')}
            </p>
          </div>
        ) : (
          notices.map((notice) => {
            const badge = getStatusBadge(notice.status)
            const demand = extractDemandAmount(notice)

            return (
              <div
                key={notice.id}
                className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 space-y-4 relative group hover:border-ink transition-colors"
              >
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <span className="font-mono text-sm font-semibold text-ink">{notice.authority}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    {t('ownerDashboard.subject', 'Subject')}
                  </p>
                  <p className="text-sm font-medium line-clamp-2 leading-relaxed">{notice.issue}</p>
                </div>

                {notice.deadline && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                      {t('ownerDashboard.deadline', 'Deadline')}
                    </p>
                    <p className="text-sm text-post-red font-bold font-mono">{notice.deadline}</p>
                  </div>
                )}

                {demand > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                      {t('ownerDashboard.statutoryExposure', 'Statutory Exposure')}
                    </p>
                    <p className="text-sm text-ink font-bold font-mono">₹{demand.toLocaleString('en-IN')}</p>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link
                    href={`/dashboard/notices/${notice.id}`}
                    className="text-sm font-bold text-ink hover:underline flex items-center gap-2"
                  >
                    {t('ownerDashboard.accessCaseFile', 'Access Case File')}{' '}
                    <span className="font-mono text-gray-400 group-hover:text-ink transition-colors">-&gt;</span>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
