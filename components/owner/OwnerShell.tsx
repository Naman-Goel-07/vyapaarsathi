'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Files, Plus, UserRound, Store, Bell, Camera, Upload, MessageCircle, Phone, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import OwnerModal from './OwnerModal'
import { noticeTone } from '@/lib/owner-ui'

type Workspace = { business: any; notices: any[]; initialCA: any; referenceId: string; email: string }
const OwnerContext = createContext<(Workspace & { openAdd: () => void; contact: (kind: 'call' | 'whatsapp') => void; pendingFiles: File[]; clearPendingFiles: () => void }) | null>(null)
export function useOwner() { const data = useContext(OwnerContext); if (!data) throw new Error('Owner workspace missing'); return data }

export default function OwnerShell({ children, business, notices, initialCA, referenceId, email }: Workspace & { children: React.ReactNode }) {
  const { t, lang, toggleLanguage } = useLanguage()
  const path = usePathname()
  const router = useRouter()
  const previousPath = useRef(path)
  useEffect(() => {
    if (previousPath.current !== path) {
      previousPath.current = path
      router.refresh()
    }
  }, [path, router])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const selectFiles = (event: React.ChangeEvent<HTMLInputElement>, mode: string) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setPendingFiles(files); event.target.value = ''; setAddOpen(false)
    router.push(`/dashboard/owner/add?mode=${mode}`)
  }
  const [addOpen, setAddOpen] = useState(false)
  const [alerts, setAlerts] = useState(false)
  const [contactMode, setContactMode] = useState<'call' | 'whatsapp' | null>(null)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState(false)
  const contactKey = `vyapaar-ca-phone-${business?.id}-${initialCA?.id}`
  useEffect(() => { try { setPhone(localStorage.getItem(contactKey) || '') } catch {} }, [contactKey])
  const launchContact = (kind: 'call' | 'whatsapp', number: string) => {
    const digits = number.replace(/\D/g, '')
    const normalized = digits.length === 10 ? `91${digits}` : digits
    window.location.href = kind === 'call' ? `tel:+${normalized}` : `https://wa.me/${normalized}?text=${encodeURIComponent(t('owner.contactWhatsApp'))}`
  }
  const contact = (kind: 'call' | 'whatsapp') => {
    if (!initialCA) { router.push('/dashboard/owner/ca'); return }
    if (!phone) { setContactMode(kind); return }
    launchContact(kind, phone)
  }
  const links = [{ key: 'home', href: '/dashboard/owner', icon: Home }, { key: 'notices', href: '/dashboard/owner/notices', icon: Files }, { key: 'add', href: '', icon: Plus }, { key: 'myCA', href: '/dashboard/owner/ca', icon: UserRound }, { key: 'account', href: '/dashboard/owner/account', icon: Store }]
  const urgent = notices.filter(n => ['overdue', 'soon'].includes(noticeTone(n)))
  const nav = links.map(({ key, href, icon: Icon }) => key === 'add' ? <button key={key} className="owner-nav-add" onClick={() => setAddOpen(true)} aria-label={t('owner.addNotice')}><span><Icon size={25} /></span><b>{t('owner.add')}</b></button> : <Link key={key} href={href} aria-current={(path === href || (key === 'notices' && path.startsWith('/dashboard/notices/'))) ? 'page' : undefined} className="owner-nav-link"><Icon size={23} /><span>{t(`owner.${key}`)}</span></Link>)
  return <OwnerContext.Provider value={{ business, notices, initialCA, referenceId, email, openAdd: () => setAddOpen(true), contact, pendingFiles, clearPendingFiles: () => setPendingFiles([]) }}>
    <div className="owner-app"><input ref={cameraRef} type="file" accept="image/jpeg,image/png" capture="environment" className="hidden" onChange={e => selectFiles(e, 'camera')} /><input ref={uploadRef} type="file" multiple accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={e => selectFiles(e, 'file')} />
      <aside className="owner-sidebar"><Link href="/dashboard/owner" className="flex items-center gap-3 px-3 py-5 font-bold text-xl"><Store />{t('common.vyapaarSathi')}</Link><nav aria-label={t('owner.account')} className="space-y-2 mt-8">{nav}</nav></aside>
      <div className="owner-workspace">
        <header className="owner-header"><Link href="/dashboard/owner" className="min-w-0 font-bold leading-snug break-words">{business?.name || t('owner.business')}</Link><div className="flex items-center shrink-0 gap-1"><button className="owner-icon relative" aria-label={`${t('owner.notifications')} (${urgent.length})`} onClick={() => setAlerts(true)}><Bell size={22} />{urgent.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ background: 'var(--red)' }} />}</button><button className="owner-language" onClick={toggleLanguage} aria-label={t('owner.language')}>{lang === 'en' ? t('owner.hindi') : t('owner.english')}</button></div></header>
        <main id="owner-main" className="owner-main">{children}</main>
      </div>
      <nav className="owner-bottom-nav" aria-label={t('owner.account')}>{nav}</nav>
      {addOpen && <OwnerModal title={t('owner.addNotice')} sheet onClose={() => setAddOpen(false)}><p className="text-slate-600">{t('owner.uploadHint')}</p><div className="space-y-3">{[{ key: 'takePhoto', mode: 'camera', icon: Camera }, { key: 'upload', mode: 'file', icon: Upload }].map(({ key, mode, icon: Icon }) => <button key={key} className="owner-option w-full" onClick={() => (mode === 'camera' ? cameraRef : uploadRef).current?.click()}><Icon /><span>{t(`owner.${key}`)}</span><ChevronRight className="ml-auto" /></button>)}<button className="owner-option w-full" onClick={() => { setAddOpen(false); contact('whatsapp') }}><MessageCircle /><span>{t('owner.sendWhatsApp')}</span><ChevronRight className="ml-auto" /></button></div></OwnerModal>}
      {alerts && <OwnerModal title={t('owner.notifications')} onClose={() => setAlerts(false)}>{urgent.length ? <div className="space-y-3">{urgent.map(n => <Link key={n.id} className="owner-option" href={`/dashboard/notices/${n.id}`} onClick={() => setAlerts(false)}>{n.authority}<ChevronRight className="shrink-0 ml-auto" /></Link>)}</div> : <p>{t('owner.noAlerts')}</p>}</OwnerModal>}
      {contactMode && <OwnerModal title={t('owner.phone')} onClose={() => setContactMode(null)}><p>{t('owner.phoneHint')}</p><form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!/^\+?[\d\s()-]{10,18}$/.test(phone) || phone.replace(/\D/g, '').length < 10) { setPhoneError(true); return }; try { localStorage.setItem(contactKey, phone) } catch {}; setContactMode(null); launchContact(contactMode, phone) }}><label className="owner-field">{t('owner.phone')}<input type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91" required /></label>{phoneError && <p role="alert">{t('owner.phoneInvalid')}</p>}<button className="owner-primary w-full" type="submit"><Phone size={18} />{t('owner.saveContact')}</button></form></OwnerModal>}
    </div>
  </OwnerContext.Provider>
}
