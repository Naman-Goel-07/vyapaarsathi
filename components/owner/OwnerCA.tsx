'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRound, Phone, MessageCircle, Mail, MoreVertical } from 'lucide-react'
import { assignCAToBusiness, unassignCAFromBusiness } from '@/app/actions'
import { useLanguage } from '@/lib/context/LanguageContext'
import { useOwner } from './OwnerShell'
import OwnerModal from './OwnerModal'
import NoticeCard from './NoticeCard'
import { nearestFirst } from '@/lib/owner-ui'

export default function OwnerCA() {
  const { initialCA: ca, business, notices, contact } = useOwner()
  const { t } = useLanguage(); const router = useRouter()
  const [menu, setMenu] = useState(false); const [edit, setEdit] = useState(false); const [remove, setRemove] = useState(false)
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const assigned = nearestFirst(notices.filter(n => n.status !== 'closed'))
  const assign = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try { const result = await assignCAToBusiness(business.id, email, name); if (!result.success) { setError(t('owner.assignmentError')); return }; setEdit(false); router.refresh() } catch { setError(t('owner.error')) } finally { setBusy(false) }
  }
  const removeCA = async () => {
    setBusy(true); setError('')
    try { const result = await unassignCAFromBusiness(business.id); if (!result.success) { setError(t('owner.error')); return }; setRemove(false); router.refresh() } catch { setError(t('owner.error')) } finally { setBusy(false) }
  }
  return <div className="space-y-5"><h1 className="owner-page-title">{t('owner.myCA')}</h1>{ca ? <><section className="owner-card space-y-5"><div className="flex gap-4 items-start"><div className="owner-department"><UserRound /></div><div className="flex-1"><p className="text-slate-500">{t('owner.yourCA')}</p><h2 className="text-2xl font-bold">{ca.name}</h2><p className="text-slate-600 break-all">{ca.email}</p></div><div className="relative"><button className="owner-icon" aria-label={t('owner.more')} aria-expanded={menu} onClick={() => setMenu(!menu)}><MoreVertical /></button>{menu && <div className="absolute right-0 top-full z-10 w-56 rounded-xl bg-white border shadow-lg p-2"><button className="owner-option w-full border-0" onClick={() => { setMenu(false); setEdit(true) }}>{t('owner.changeCA')}</button><button className="owner-option w-full border-0" onClick={() => { setMenu(false); setRemove(true) }}>{t('owner.removeCA')}</button></div>}</div></div><div className="grid sm:grid-cols-3 gap-3"><button className="owner-primary" onClick={() => contact('call')}><Phone size={20} />{t('owner.call')}</button><button className="owner-secondary" onClick={() => contact('whatsapp')}><MessageCircle size={20} />{t('owner.whatsapp')}</button><a className="owner-secondary" href={`mailto:${ca.email}`}><Mail size={20} />{t('owner.email')}</a></div></section><section><h2 className="text-xl font-bold mb-3">{t('owner.caNotices')}</h2><div className="space-y-3">{assigned.length ? assigned.map(n => <NoticeCard key={n.id} notice={n} />) : <p className="owner-card">{t('owner.emptyFilter')}</p>}</div></section></> : <section className="owner-empty"><UserRound size={40} className="mx-auto mb-4 text-blue-700" /><h2 className="text-2xl font-bold">{t('owner.noCA')}</h2><p className="text-slate-600 my-4">{t('owner.noCAHint')}</p><button className="owner-primary w-full sm:w-auto" onClick={() => setEdit(true)}>{t('owner.connect')}</button><a className="owner-text-link justify-center w-full mt-3" href={`mailto:?subject=${encodeURIComponent(t('owner.inviteSubject'))}&body=${encodeURIComponent(t('owner.inviteBody'))}`}>{t('owner.invite')}</a></section>}
    {edit && <OwnerModal title={t(ca ? 'owner.changeCA' : 'owner.connect')} onClose={() => { if (!busy) { setEdit(false); setError('') } }}><form className="space-y-4" onSubmit={assign}><label className="owner-field">{t('owner.caEmail')}<input autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label className="owner-field">{t('owner.caName')}<input value={name} onChange={e => setName(e.target.value)} /></label>{error && <p role="alert">{error}</p>}<button type="submit" className="owner-primary w-full" disabled={busy}>{t(busy ? 'owner.saving' : 'owner.connect')}</button><a className="owner-text-link" href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(t('owner.inviteSubject'))}&body=${encodeURIComponent(t('owner.inviteBody'))}`}>{t('owner.invite')}</a></form></OwnerModal>}
    {remove && <OwnerModal title={t('owner.removeConfirm')} onClose={() => { if (!busy) { setRemove(false); setError('') } }}><p>{t('owner.removeHint')}</p>{error && <p role="alert">{error}</p>}<button className="owner-primary w-full" disabled={busy} onClick={removeCA}>{t(busy ? 'owner.saving' : 'owner.removeCA')}</button><button className="owner-secondary w-full" disabled={busy} onClick={() => setRemove(false)}>{t('owner.cancel')}</button></OwnerModal>}
  </div>
}
