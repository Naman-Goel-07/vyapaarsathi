'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { useOwner } from './OwnerShell'
import { money, noticeTitle, noticeTone, shortDate } from '@/lib/owner-ui'
import { extractDemandAmount } from '@/lib/demand'
import NoticeCard, { useCountdown } from './NoticeCard'
import CAStrip from './CAStrip'
import NoticePDFViewer from '@/components/NoticePDFViewer'
import CollaborativePipeline from '@/components/CollaborativePipeline'
import VernacularVoiceAssistant from '@/components/VernacularVoiceAssistant'
import TaskGraph from '@/components/TaskGraph'

export function OwnerNoticeNotFound() {
  const { t } = useLanguage()
  return (
    <section className="owner-card space-y-4">
      <h1 className="owner-page-title">{t('owner.notFound')}</h1>
      <p>{t('owner.notFoundHint')}</p>
      <Link className="owner-primary" href="/dashboard/owner/notices">{t('owner.back')}</Link>
    </section>
  )
}

export default function OwnerNoticeDetail({ notice, tasks, pastNotices }: { notice: any; tasks: any[]; pastNotices: any[] }) {
  const { t, lang } = useLanguage()
  const { business } = useOwner()
  const countdown = useCountdown()
  const amount = extractDemandAmount(notice)
  const summary = notice.issue?.replace(/\[(?:Demand|Penalty|Exposure|DIN)[^\]]*\]/gi, '').trim()
  const isOpen = notice.status !== 'closed' && notice.status !== 'filed'
  const common = { authority: notice.authority, form: notice.form, issue: notice.issue, deadline: notice.deadline, penaltyAmount: amount, businessName: business?.name }

  return (
    <article className="owner-detail space-y-5">
      <Link className="owner-text-link gap-2" href="/dashboard/owner/notices"><ArrowLeft size={20} />{t('owner.back')}</Link>

      <header className="space-y-1">
        <p className="owner-sub">{t(`owner.${noticeTitle(notice)}`)}</p>
        {amount > 0 && <p className="text-3xl font-semibold">{money(amount)}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span>{notice.deadline ? `${t('owner.replyByShort')} ${shortDate(notice.deadline, lang)}` : t('owner.noDeadline')}</span>
          {(notice.deadline || !isOpen) && <span className={`owner-status tone-${noticeTone(notice)}`}>{countdown(notice)}</span>}
        </div>
      </header>

      <VernacularVoiceAssistant ownerView {...common} penaltyAmount={amount || null} />

      <section className="owner-card space-y-2">
        <h2 className="owner-section-title">{t('owner.summary')}</h2>
        {(!notice.confidence || notice.confidence < 0.8) && <p className="tone-neutral rounded-lg p-3 text-sm">{t('owner.lowConfidence')}</p>}
        <p className="whitespace-pre-wrap">{summary || t('owner.lowConfidence')}</p>
        <p className="owner-sub">{notice.authority}</p>
      </section>

      <CollaborativePipeline ownerView noticeId={notice.id} initialNoticeStatus={notice.status} initialTasks={tasks} userRole="owner" authority={notice.authority} form={notice.form} />

      <CAStrip />

      <NoticePDFViewer ownerView noticeId={notice.id} rawFileUrl={notice.raw_file_url} {...common} confidence={notice.confidence || 0} userRole="owner" />

      <details className="owner-card">
        <summary>{t('owner.tasks')}</summary>
        <div className="pt-3"><TaskGraph ownerView noticeId={notice.id} initialTasks={tasks} userRole="owner" noticeStatus={notice.status} /></div>
      </details>

      {pastNotices.length > 0 && (
        <section>
          <h2 className="owner-section-title">{t('owner.past')}</h2>
          <div className="owner-list">{pastNotices.map(n => <NoticeCard key={n.id} notice={n} />)}</div>
        </section>
      )}
    </article>
  )
}
