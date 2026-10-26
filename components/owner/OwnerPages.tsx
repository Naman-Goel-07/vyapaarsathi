'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Camera, Phone, MessageCircle, ArrowUpRight, Check, AlertCircle, CalendarDays, Files, Languages, HelpCircle, LogOut } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { useOwner } from './OwnerShell'
import NoticeCard from './NoticeCard'
import { extractDemandAmount } from '@/lib/demand'
import { nearestFirst, noticeTone, noticeGroup, shortDate, money, daysLeft } from '@/lib/owner-ui'
import WhatsAppBotSimulator from '@/components/WhatsAppBotSimulator'

export function EmptyNotices({ filtered = false }: { filtered?: boolean }) {
  const { t } = useLanguage(); const { openAdd } = useOwner()
  return <div className="owner-empty"><Files size={36} className="mx-auto mb-4 text-slate-400" /><h2 className="text-xl font-bold">{t('owner.noNotices')}</h2><p className="text-slate-600 mt-2 mb-5">{t(filtered ? 'owner.emptyFilter' : 'owner.emptyHint')}</p><button className="owner-primary w-full sm:w-auto" onClick={openAdd}>{t('owner.addNotice')}</button></div>
}
export function OwnerHome() {
  const { notices, openAdd, contact } = useOwner(); const { t, lang } = useLanguage()
  const overdue = notices.filter(n => noticeTone(n) === 'overdue').length
  const soon = notices.filter(n => noticeTone(n) === 'soon').length
  const active = notices.filter(n => !['closed', 'filed'].includes(n.status))
  const missingDates = active.filter(n => daysLeft(n.deadline) === null).length
  const next = nearestFirst(active.filter(n => daysLeft(n.deadline) !== null && daysLeft(n.deadline)! >= 0))[0]
  const amount = active.reduce((sum, n) => sum + extractDemandAmount(n), 0)
  const status = overdue ? t(overdue === 1 ? 'owner.overdueOne' : 'owner.overdueMany').replace('{count}', String(overdue)) : soon ? t('owner.dueSoon').replace('{count}', String(soon)) : missingDates ? t('owner.missingDates').replace('{count}', String(missingDates)) : t('owner.allGood')
  return <div className="space-y-6"><h1 className="owner-page-title">{t('owner.hello')}</h1>
    <div className={`owner-health tone-${overdue ? 'overdue' : soon ? 'soon' : missingDates ? 'neutral' : 'fine'}`}><span className="owner-health-icon">{overdue || soon || missingDates ? <AlertCircle size={28} /> : <Check size={28} />}</span><p className="text-2xl font-bold leading-snug">{status}</p></div>
    <div className={`grid gap-4 ${amount > 0 ? 'lg:grid-cols-2' : ''}`}><section className="owner-card"><h2 className="owner-label"><CalendarDays size={20} />{t('owner.nextDeadline')}</h2>{next ? <Link href={`/dashboard/notices/${next.id}`} className="flex justify-between items-center gap-4 mt-3"><div><p className="text-3xl font-bold">{shortDate(next.deadline, lang)}</p><p className="text-slate-600 mt-2">{next.authority}</p></div><ArrowUpRight /></Link> : <p className="mt-3 text-slate-600">{t('owner.noUpcoming')}</p>}</section>{amount > 0 && <section className="owner-card"><h2 className="owner-label">{t('owner.moneyRisk')}</h2><p className="text-3xl font-bold mt-3 break-words">{money(amount)}</p><p className="text-slate-600 mt-2">{t('owner.moneyHint')}</p></section>}</div>
    <div className="grid grid-cols-3 gap-2 sm:gap-4">{[{ key: 'scan', icon: Camera, action: openAdd }, { key: 'call', icon: Phone, action: () => contact('call') }, { key: 'whatsapp', icon: MessageCircle, action: () => contact('whatsapp') }].map(({ key, icon: Icon, action }) => <button key={key} onClick={action} className="owner-quick"><Icon size={24} /><span>{t(`owner.${key}`)}</span></button>)}</div>
    <section><div className="flex items-center justify-between gap-3 mb-3"><h2 className="text-xl font-bold">{t('owner.recent')}</h2><Link className="owner-text-link" href="/dashboard/owner/notices">{t('owner.viewAll')}</Link></div>{notices.length ? <div className="space-y-3">{notices.slice(0, 3).map(n => <NoticeCard key={n.id} notice={n} />)}</div> : <EmptyNotices />}</section>
  </div>
}
export function OwnerNotices() {
  const { notices } = useOwner(); const { t } = useLanguage(); const [filter, setFilter] = useState('needsAction')
  const visible = nearestFirst(notices.filter(n => noticeGroup(n) === filter))
  return <div className="space-y-5"><div><h1 className="owner-page-title">{t('owner.notices')}</h1><p className="text-slate-600 mt-2">{t('owner.noticesHint')}</p></div><div className="flex flex-wrap gap-2" role="group" aria-label={t('owner.notices')}>{['needsAction', 'withCA', 'closed'].map(key => <button className="owner-chip" aria-pressed={filter === key} key={key} onClick={() => setFilter(key)}>{t(`owner.${key}`)} <span>({notices.filter(n => noticeGroup(n) === key).length})</span></button>)}</div>{visible.length ? <div className="grid gap-3 xl:grid-cols-2">{visible.map(n => <NoticeCard key={n.id} notice={n} />)}</div> : <EmptyNotices filtered={notices.length > 0} />}</div>
}
export function OwnerAccount() {
  const { business, email, referenceId } = useOwner(); const { t, lang, setLanguage } = useLanguage(); const [demo, setDemo] = useState(false)
  return <div className="space-y-5"><h1 className="owner-page-title">{t('owner.account')}</h1><section className="owner-card space-y-4"><h2 className="text-xl font-bold">{t('owner.details')}</h2><p className="font-bold">{business?.name || t('owner.business')}</p><p className="break-all text-slate-600">{email}</p><span className="owner-status tone-closed">{t('owner.ownerDesk')}</span><dl className="pt-4 border-t"><dt className="text-slate-500">{t('owner.refId')}</dt><dd className="mt-1 break-all">{referenceId}</dd></dl></section><section className="owner-card"><h2 className="owner-label"><Languages size={20} />{t('owner.language')}</h2><div className="flex gap-3 mt-4">{(['en', 'hi'] as const).map(l => <button key={l} aria-pressed={lang === l} className="owner-chip flex-1" onClick={() => setLanguage(l)}>{t(l === 'en' ? 'owner.english' : 'owner.hindi')}</button>)}</div></section><section className="owner-card space-y-4"><h2 className="owner-label"><MessageCircle size={20} />{t('owner.bot')}</h2><p className="text-slate-600">{t('owner.botHint')}</p><button className="owner-secondary w-full sm:w-auto" onClick={() => setDemo(true)}>{t('owner.botDemo')}</button></section><details className="owner-card"><summary className="owner-label cursor-pointer"><HelpCircle size={20} />{t('owner.help')}</summary><p className="mt-4 text-slate-600">{t('owner.helpText')}</p></details><form action="/auth/signout" method="post"><button className="owner-secondary w-full sm:w-auto" type="submit"><LogOut size={20} />{t('owner.logout')}</button></form>{demo && <WhatsAppBotSimulator ownerView defaultOpen onClose={() => setDemo(false)} />}</div>
}
