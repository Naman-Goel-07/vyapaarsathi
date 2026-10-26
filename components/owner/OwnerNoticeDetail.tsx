'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { useOwner } from './OwnerShell'
import { noticeTitle, noticeTone, shortDate } from '@/lib/owner-ui'
import { extractDemandAmount, extractDIN } from '@/lib/demand'
import { useCountdown } from './NoticeCard'
import OwnerCost from './OwnerCost'
import OwnerDisclosure from './OwnerDisclosure'
import NoticePDFViewer from '@/components/NoticePDFViewer'
import CollaborativePipeline from '@/components/CollaborativePipeline'
import VernacularVoiceAssistant from '@/components/VernacularVoiceAssistant'
import StatutoryReplyGenerator from '@/components/StatutoryReplyGenerator'
import CalendarDesk from '@/components/CalendarDesk'
import TaskGraph from '@/components/TaskGraph'
import NoticeCard from './NoticeCard'

export function OwnerNoticeNotFound() {
  const { t } = useLanguage()
  return <section className="owner-card space-y-4"><h1 className="owner-page-title">{t('owner.notFound')}</h1><p>{t('owner.notFoundHint')}</p><Link className="owner-primary" href="/dashboard/owner/notices">{t('owner.back')}</Link></section>
}
export default function OwnerNoticeDetail({ notice, tasks, pastNotices }: { notice: any; tasks: any[]; pastNotices: any[] }) {
  const { t, lang } = useLanguage(); const { contact, business } = useOwner(); const countdown = useCountdown()
  const taskSection = useRef<HTMLDetailsElement>(null)
  const common = { authority: notice.authority, form: notice.form, issue: notice.issue, deadline: notice.deadline, penaltyAmount: extractDemandAmount(notice), businessName: business?.name }
  return <article className="owner-detail space-y-5"><Link className="owner-text-link gap-2" href="/dashboard/owner/notices"><ArrowLeft size={20} />{t('owner.back')}</Link>
    <header className="space-y-3"><h1 className="owner-page-title">{t(`owner.${noticeTitle(notice)}`)}</h1><p className="text-slate-600">{notice.authority}</p><span className={`owner-status tone-${noticeTone(notice)}`}>{countdown(notice)}</span></header>
    <section className="owner-card space-y-4"><h2 className="text-xl font-bold">{t('owner.summary')}</h2>{(!notice.confidence || notice.confidence < .8) && <p className="rounded-xl bg-blue-50 p-3">{t('owner.lowConfidence')}</p>}<p className="whitespace-pre-wrap">{notice.issue?.replace(/\[(?:Demand|Penalty|Exposure|DIN)[^\]]*\]/gi, '').trim() || t('owner.lowConfidence')}</p><div className="border-t pt-4"><p className="text-slate-500">{t('owner.deadline')}</p><p className="font-bold text-xl">{notice.deadline ? shortDate(notice.deadline, lang) : t('owner.noDeadline')}</p></div></section>
    <OwnerCost notice={notice} />
    <CollaborativePipeline ownerView noticeId={notice.id} initialNoticeStatus={notice.status} initialTasks={tasks} userRole="owner" authority={notice.authority} form={notice.form} />
    <NoticePDFViewer ownerView noticeId={notice.id} rawFileUrl={notice.raw_file_url} {...common} confidence={notice.confidence || 0} userRole="owner" />
    <OwnerDisclosure title={t('owner.listen')}><VernacularVoiceAssistant ownerView {...common} /></OwnerDisclosure>
    <details ref={taskSection} id="owner-checklist" className="owner-card"><summary>{t('owner.tasks')}</summary><p className="text-slate-600 mt-3 mb-4">{t('owner.doneHint')}</p><TaskGraph ownerView noticeId={notice.id} initialTasks={tasks} userRole="owner" noticeStatus={notice.status} /></details>
    <OwnerDisclosure title={t('owner.reply')}><StatutoryReplyGenerator ownerView noticeId={notice.id} {...common} dinNumber={extractDIN(notice)} currentStatus={notice.status} userRole="owner" /></OwnerDisclosure>
    <OwnerDisclosure title={t('owner.reminders')}><CalendarDesk ownerView deadline={notice.deadline} noticeId={notice.id} createdAt={notice.created_at} businessName={business?.name} /></OwnerDisclosure>
    <details className="owner-card"><summary>{t('owner.past')}</summary><div className="space-y-3 pt-4">{pastNotices.length ? pastNotices.map(n => <NoticeCard key={n.id} notice={n} />) : <p>{t('owner.noPast')}</p>}</div></details>
    <details className="owner-card"><summary>{t('owner.activity')}</summary><ol className="mt-4 space-y-4"><li><p>{t('owner.logged')}</p><time className="text-slate-500">{shortDate(notice.created_at, lang)}</time></li>{tasks.map(task => <li key={task.id}><p>{task.action || t('owner.taskUpdated')}</p><p className="text-slate-500">{shortDate(task.created_at, lang)} · {t(task.status === 'completed' ? 'owner.completed' : 'owner.pending')}</p></li>)}</ol></details>
    <div className="owner-detail-bar"><button className="owner-secondary" onClick={() => contact('call')}><Phone size={20} />{t('owner.call')}</button><button className="owner-primary" disabled={notice.status === 'closed'} onClick={() => { if (taskSection.current) { taskSection.current.open = true; taskSection.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); taskSection.current.querySelector('button')?.focus({ preventScroll: true }) } }}>{t(notice.status === 'closed' ? 'owner.closed' : 'owner.done')}</button></div>
  </article>
}
