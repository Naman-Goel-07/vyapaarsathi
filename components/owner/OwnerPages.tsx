'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Camera, Files, Languages, HelpCircle, LogOut, MessageCircle, Send } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { useOwner } from './OwnerShell'
import NoticeCard, { useCountdown, useStatusLine } from './NoticeCard'
import CAStrip from './CAStrip'
import { nearestFirst, noticeTone, noticeGroup, noticeTitle, shortDate, waitingOnOwner } from '@/lib/owner-ui'
import WhatsAppBotSimulator from '@/components/WhatsAppBotSimulator'

const isOpen = (n: any) => n.status !== 'closed' && n.status !== 'filed'
const GROUPS = ['needsAction', 'withCA', 'closed'] as const

export function EmptyNotices({ filtered = false }: { filtered?: boolean }) {
  const { t } = useLanguage(); const { openAdd } = useOwner()
  return (
    <div className="owner-empty">
      <Files size={32} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
      <h2 className="text-lg font-semibold">{t('owner.noNotices')}</h2>
      <p className="owner-sub mt-1 mb-4">{t(filtered ? 'owner.emptyFilter' : 'owner.emptyHint')}</p>
      {!filtered && <button className="owner-primary" onClick={openAdd}>{t('owner.addNotice')}</button>}
    </div>
  )
}

export function OwnerHome() {
  const { notices, openAdd } = useOwner()
  const { t, lang } = useLanguage()
  const countdown = useCountdown()
  const statusLine = useStatusLine()
  const open = nearestFirst(notices.filter(isOpen))
  const done = notices.filter(n => !isOpen(n))
  const urgent = open.find(n => waitingOnOwner(n)) || open[0]
  const title = open.length === 0 ? t('owner.allClear')
    : open.length === 1 ? t('owner.openOne')
    : t('owner.openMany').replace('{count}', String(open.length))
  return (
    <div className="space-y-5">
      <h1 className="owner-page-title">{title}</h1>

      {urgent && (
        <Link href={`/dashboard/notices/${urgent.id}`} className={`owner-urgent tone-${noticeTone(urgent)}`}>
          <p className="text-sm font-semibold">{t('owner.mostUrgent')}</p>
          <p className="text-xl font-semibold mt-1">{t(`owner.${noticeTitle(urgent)}`)} · {countdown(urgent)}</p>
          <p className="mt-1">
            {statusLine(urgent)}
            {urgent.deadline && ` · ${t('owner.replyByShort')} ${shortDate(urgent.deadline, lang)}`}
          </p>
          <span className="owner-primary mt-3">{t('owner.openNotice')}</span>
        </Link>
      )}

      <button className="owner-camera" onClick={openAdd}>
        <Camera size={28} aria-hidden="true" />
        <span>
          <span className="block text-lg font-semibold">{t('owner.cameraTitle')}</span>
          <span className="block text-sm">{t('owner.cameraHint')}</span>
        </span>
      </button>

      <section>
        <h2 className="owner-section-title">{t('owner.yourNotices')}</h2>
        {notices.length
          ? <div className="owner-list">{[...open, ...done].slice(0, 6).map(n => <NoticeCard key={n.id} notice={n} />)}</div>
          : <EmptyNotices />}
        {notices.length > 6 && <Link className="owner-text-link" href="/dashboard/owner/notices">{t('owner.viewAll')}</Link>}
      </section>

      <CAStrip />
    </div>
  )
}

export function OwnerNotices() {
  const { notices } = useOwner()
  const { t } = useLanguage()
  const [filter, setFilter] = useState<string>(() => GROUPS.find(g => notices.some(n => noticeGroup(n) === g)) || 'needsAction')
  const visible = nearestFirst(notices.filter(n => noticeGroup(n) === filter))
  return (
    <div className="space-y-4">
      <h1 className="owner-page-title">{t('owner.notices')}</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('owner.notices')}>
        {GROUPS.map(key => {
          const count = notices.filter(n => noticeGroup(n) === key).length
          return (
            <button key={key} className="owner-chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {t(`owner.${key}`)}{count > 0 && ` · ${count}`}
            </button>
          )
        })}
      </div>
      {visible.length
        ? <div className="owner-list">{visible.map(n => <NoticeCard key={n.id} notice={n} />)}</div>
        : <EmptyNotices filtered={notices.length > 0} />}
    </div>
  )
}
export function OwnerAccount() {
  const { business, email, referenceId } = useOwner()
  const { t, lang, setLanguage } = useLanguage()
  const [demo, setDemo] = useState(false)
  return (
    <div className="space-y-5">
      <h1 className="owner-page-title">{t('owner.account')}</h1>
      <section className="owner-card space-y-4">
        <h2 className="text-xl font-bold">{t('owner.details')}</h2>
        <p className="font-bold">{business?.name || t('owner.business')}</p>
        <p className="break-all text-slate-600">{email}</p>
        <span className="owner-status tone-closed">{t('owner.ownerDesk')}</span>
        <dl className="pt-4 border-t">
          <dt className="text-slate-500">{t('owner.refId')}</dt>
          <dd className="mt-1 break-all">{referenceId}</dd>
        </dl>
      </section>
      <Link href="/dashboard/telegram" className="owner-option">
        <Send size={20} aria-hidden="true" />
        {lang === 'hi' ? 'टेलीग्राम अपडेट' : 'Telegram updates'}
      </Link>
      <section className="owner-card">
        <h2 className="owner-label"><Languages size={20} />{t('owner.language')}</h2>
        <div className="flex gap-3 mt-4">
          {(['en', 'hi'] as const).map(l => (
            <button key={l} aria-pressed={lang === l} className="owner-chip flex-1" onClick={() => setLanguage(l)}>
              {t(l === 'en' ? 'owner.english' : 'owner.hindi')}
            </button>
          ))}
        </div>
      </section>
      <section className="owner-card space-y-4">
        <h2 className="owner-label"><MessageCircle size={20} />{t('owner.bot')}</h2>
        <p className="text-slate-600">{t('owner.botHint')}</p>
        <button className="owner-secondary w-full sm:w-auto" onClick={() => setDemo(true)}>{t('owner.botDemo')}</button>
      </section>
      <details className="owner-card">
        <summary className="owner-label cursor-pointer"><HelpCircle size={20} />{t('owner.help')}</summary>
        <p className="mt-4 text-slate-600">{t('owner.helpText')}</p>
      </details>
      <form action="/auth/signout" method="post">
        <button className="owner-secondary w-full sm:w-auto" type="submit"><LogOut size={20} />{t('owner.logout')}</button>
      </form>
      {demo && <WhatsAppBotSimulator ownerView defaultOpen onClose={() => setDemo(false)} />}
    </div>
  )
}
