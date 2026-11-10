import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/supabase/session'
import OwnerEducation from '@/components/owner/OwnerEducation'
import './education.css'

export default async function EducationPage() {
  if ((await getProfile())?.role !== 'owner') redirect('/dashboard/ca')
  return <OwnerEducation />
}
