'use client'
import { useSearchParams } from 'next/navigation'
import { useOwner } from './OwnerShell'
import { useLanguage } from '@/lib/context/LanguageContext'
import UploadNotice from '@/components/UploadNotice'
export default function OwnerAdd() {
  const { business, pendingFiles, clearPendingFiles } = useOwner(); const { t } = useLanguage(); const search = useSearchParams()
  return <div className="space-y-5"><h1 className="owner-page-title">{t('owner.addNotice')}</h1><UploadNotice businessId={business.id} initialFiles={pendingFiles} onFilesQueued={clearPendingFiles} ownerView captureMode={search.get('mode') === 'camera'} /></div>
}
