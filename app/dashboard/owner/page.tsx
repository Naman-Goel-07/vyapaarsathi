import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DynamicPenaltyDesk from '@/components/DynamicPenaltyDesk'
import ComplianceScoreboard from '@/components/ComplianceScoreboard'
import DesignatedCADesk from '@/components/DesignatedCADesk'
import OwnerNoticesGrid from '@/components/OwnerNoticesGrid'

export default async function OwnerDashboard() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner') return redirect('/dashboard/ca')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, ca_id')
    .eq('id', profile.business_id)
    .single()

  let initialCA = null
  if (business?.ca_id) {
    const { data: caProfile } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', business.ca_id)
      .maybeSingle()

    if (caProfile) {
      initialCA = {
        id: caProfile.id,
        email: caProfile.email,
        name: caProfile.full_name || caProfile.email.split('@')[0].toUpperCase(),
        firm: 'Retained Statutory Counsel'
      }
    }
  }

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('business_id', profile.business_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* THE COMPLIANCE SCOREBOARD */}
      <ComplianceScoreboard notices={notices || []} />

      {/* ORDER 4: DESIGNATED CHARTERED ACCOUNTANT & BUSINESS COUNSEL DESK */}
      <DesignatedCADesk
        businessName={business?.name || 'My Enterprise'}
        businessId={profile.business_id}
        initialCA={initialCA}
      />

      {/* SLIDE 2 & 6: DYNAMIC PENALTY EXPOSURE & LATE FEE ENGINE */}
      <DynamicPenaltyDesk notices={notices || []} />

      {/* INCOMING DISPATCHES & NOTICES REGISTRY */}
      <OwnerNoticesGrid
        notices={notices || []}
        businessId={profile.business_id}
      />
    </div>
  )
}
