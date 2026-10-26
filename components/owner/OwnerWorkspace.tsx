import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Noto_Sans, Noto_Sans_Devanagari } from 'next/font/google'
import OwnerShell from './OwnerShell'
import './owner.css'
const noto = Noto_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-owner' })
const devanagari = Noto_Sans_Devanagari({ subsets: ['devanagari'], display: 'swap', variable: '--font-owner-hi' })
export default async function OwnerWorkspace({ children }: { children: React.ReactNode }) {
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

  return <div className={`${noto.variable} ${devanagari.variable}`}><OwnerShell business={business || { id: profile.business_id, name: '' }} notices={notices || []} initialCA={initialCA} referenceId={user.id.split('-')[0].toUpperCase()} email={user.email || ''}>{children}</OwnerShell></div>
}
