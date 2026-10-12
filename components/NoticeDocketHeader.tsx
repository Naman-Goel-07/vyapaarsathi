'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Calendar } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

interface NoticeDocketHeaderProps {
  noticeId: string
  backHref: string
  createdAt?: string
  authority: string
  form: string
  businessName: string
  status: string
  issue: string
  deadline?: string | null
  confidence?: number | null
}

export default function NoticeDocketHeader({
  noticeId,
  backHref,
  createdAt,
  authority,
  form,
  businessName,
  status,
  issue,
  deadline,
  confidence
}: NoticeDocketHeaderProps) {
  const { t, lang } = useLanguage()

  const getStatusBadge = (s: string) => {
    if (s === 'closed') {
      return {
        label: t('badges.closed', 'CLOSED'),
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }
    }
    if (s === 'filed') {
      return {
        label: t('badges.filed', 'FILED'),
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      }
    }
    return {
      label: t('badges.actionReq', 'ACTION REQ'),
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  const badge = getStatusBadge(status)

  return (
    <>
      {/* Navigation & Header Breadcrumb */}
      <div className="flex justify-between items-center">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ArrowLeft size={14} /> {t('noticeDetail.backToDashboard', 'Back to Dashboard')}
        </Link>

        <span className="font-mono text-xs text-gray-400">
          {t('noticeDetail.fileId', 'FILE ID:')} {noticeId.substring(0, 8)}...
        </span>
      </div>

      {/* Official Notice Docket Overview Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                {t('noticeDetail.caseDocket', 'Official Case Docket')}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              {authority} • {form}
            </h2>
            <p className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
              <Building2 size={13} className="text-gray-400" />
              {t('noticeDetail.establishment', 'Establishment:')} {businessName || (lang === 'hi' ? 'पंजीकृत एमएसएमई' : 'Registered MSME')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${badge.className}`}
            >
              {t('noticeDetail.statusLabel', 'Status:')} {badge.label}
            </span>
          </div>
        </div>

        {/* Notice Particulars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="space-y-1 md:col-span-2">
            <span className="font-mono text-[10px] uppercase font-bold text-gray-400 block">
              {t('noticeDetail.statutoryFindings', 'Statutory Findings & Alleged Discrepancy')}
            </span>
            <p className="text-gray-800 leading-relaxed font-sans">{issue}</p>
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Calendar size={11} /> {t('noticeDetail.complianceDeadline', 'Compliance Deadline')}
              </span>
              <p className="font-mono text-sm font-bold text-red-600 mt-0.5">
                {deadline || t('noticeDetail.noDeadlineRecorded', 'No statutory deadline recorded')}
              </p>
            </div>
            {confidence && (
              <div className="pt-1 border-t border-slate-200/60">
                <span className="font-mono text-[10px] text-gray-400">
                  {t('noticeDetail.confidenceScore', 'AI Extraction Confidence:')} {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
