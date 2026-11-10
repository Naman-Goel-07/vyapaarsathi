import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getSessionUser } from '@/lib/supabase/session'
import OwnerShell from './OwnerShell'
import './owner.css'

// The list never shows the original file, which can be several MB per notice.
const NOTICE_LIST_COLUMNS = 'id, business_id, authority, form, issue, deadline, status, confidence, created_at, tasks(id, status, owner_role, documents_requested)'

export default async function OwnerWorkspace({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) return redirect('/login')
  const profile = await getProfile()
  if (profile?.role !== 'owner') return redirect('/dashboard/ca')

  const supabase = createClient()
  const [{ data: business }, { data: notices }] = await Promise.all([
    supabase.from('businesses').select('id, name, ca_id').eq('id', profile.business_id).single(),
    supabase.from('notices').select(NOTICE_LIST_COLUMNS).eq('business_id', profile.business_id).order('created_at', { ascending: false }),
  ])

  let initialCA = null
  if (business?.ca_id) {
    const { data: ca } = await supabase.from('profiles').select('id, email, full_name').eq('id', business.ca_id).maybeSingle()
    if (ca) initialCA = { id: ca.id, email: ca.email, name: ca.full_name || ca.email.split('@')[0].toUpperCase(), firm: 'Retained Statutory Counsel' }
  }

  return (
    <OwnerShell business={business || { id: profile.business_id, name: '' }} notices={notices || []} initialCA={initialCA} referenceId={user.id.split('-')[0].toUpperCase()} email={user.email || ''}>
      {children}
    </OwnerShell>
  )
}
