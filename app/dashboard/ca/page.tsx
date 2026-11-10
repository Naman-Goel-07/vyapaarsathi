import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getSessionUser } from '@/lib/supabase/session'
import ComplianceScoreboard from '@/components/ComplianceScoreboard'
import CAInteractiveWorkbench from '@/components/CAInteractiveWorkbench'
import CAHeaderBanner from '@/components/CAHeaderBanner'

// raw_file_url holds the whole uploaded file and the dashboard never shows it
const NOTICE_COLUMNS = 'id, business_id, authority, form, issue, deadline, status, confidence, created_at, businesses(id, name)'

export default async function CADashboard() {
  const user = await getSessionUser()
  if (!user) return redirect('/login')
  const profile = await getProfile()
  if (profile?.role !== 'ca') return redirect('/dashboard/owner')
  const supabase = createClient()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('ca_id', user.id)
    .order('created_at', { ascending: false })
  const businessIds = (businesses || []).map((b) => b.id)
  let notices: any[] = []
  if (businessIds.length > 0) {
    const { data } = await supabase
      .from('notices')
      .select(NOTICE_COLUMNS)
      .in('business_id', businessIds)
      .order('created_at', { ascending: false })
    notices = data || []
  }
  return (
    <div className="ca-page">
      <CAHeaderBanner />
      <ComplianceScoreboard notices={notices} />
      <CAInteractiveWorkbench initialNotices={notices} initialBusinesses={businesses || []} />
    </div>
  )
}
