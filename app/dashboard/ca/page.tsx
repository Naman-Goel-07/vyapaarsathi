import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ComplianceScoreboard from '@/components/ComplianceScoreboard'
import CAInteractiveWorkbench from '@/components/CAInteractiveWorkbench'

export default async function CADashboard() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ca') return redirect('/dashboard/owner')

  // Fetch only client businesses that have explicitly retained this CA
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('ca_id', user.id)
    .order('created_at', { ascending: false })

  const businessIds = (businesses || []).map((b) => b.id)

  // Fetch notices only for this CA's retained client businesses
  let notices: any[] = []
  if (businessIds.length > 0) {
    const { data: clientNotices } = await supabase
      .from('notices')
      .select('*, businesses(id, name)')
      .in('business_id', businessIds)
      .order('created_at', { ascending: false })
    notices = clientNotices || []
  }

  return (
    <div className="space-y-6">
      {/* SLIDE 10: THE SCOREBOARD */}
      <ComplianceScoreboard />

      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-ink"></div>
        <div className="pl-4">
          <h2 className="text-2xl font-bold font-serif tracking-tight">Active Docket & Client Roster</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Registry of pending statutory actions and retained enterprises.</p>
        </div>
      </div>

      {/* ORDER 4: MULTI-CLIENT PORTFOLIO + DYNAMIC RISK DESK + TRIAGE HEATMAP */}
      <CAInteractiveWorkbench
        initialNotices={notices || []}
        initialBusinesses={businesses || []}
      />
    </div>
  )
}
