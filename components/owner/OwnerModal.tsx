'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function OwnerModal({ title, children, onClose, sheet = false }: { title: string; children: React.ReactNode; onClose: () => void; sheet?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useLanguage()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow; dialog?.close(); previous?.focus() }
  }, [])
  return <dialog ref={ref} className={`owner-modal ${sheet ? 'owner-sheet' : ''}`} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }} aria-labelledby="owner-dialog-title">
    <div className="p-5 sm:p-7 space-y-5">
      <div className="flex items-start justify-between gap-3"><h2 id="owner-dialog-title" className="text-xl font-bold">{title}</h2><button className="owner-icon" onClick={onClose} aria-label={t('owner.close')}><X /></button></div>
      {children}
    </div>
  </dialog>
}
