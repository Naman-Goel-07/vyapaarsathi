import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DynamicPenaltyDesk from '@/components/DynamicPenaltyDesk'
import ComplianceScoreboard from '@/components/ComplianceScoreboard'
import CATriageHeatmap from '@/components/CATriageHeatmap'

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

  // Fetch all notices with their business names
  const { data: notices } = await supabase
    .from('notices')
    .select('*, businesses(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* SLIDE 10: THE SCOREBOARD */}
      <ComplianceScoreboard />

      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-ink"></div>
        <div className="pl-4">
          <h2 className="text-2xl font-bold font-serif tracking-tight">Active Docket</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Registry of pending actions and compliance matters across all clients.</p>
        </div>
      </div>

      {/* SLIDE 2 & 6: DYNAMIC PENALTY EXPOSURE ENGINE */}
      <DynamicPenaltyDesk notices={notices || []} />

      {/* ORDER 3: CA TRIAGE HEATMAP */}
      <CATriageHeatmap notices={notices || []} />
    </div>
  )
}
