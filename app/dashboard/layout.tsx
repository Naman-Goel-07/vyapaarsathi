import OwnerWorkspace from '@/components/owner/OwnerWorkspace'
import CADashboardShell from '@/components/CADashboardShell'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardHeaderControls from '@/components/DashboardHeaderControls'
import { getProfile, getSessionUser } from '@/lib/supabase/session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) return redirect('/login')
  const profile = await getProfile()
  if (profile?.role === 'owner') return <OwnerWorkspace>{children}</OwnerWorkspace>
  if (profile?.role === 'ca') return <CADashboardShell reference={user.id.split('-')[0].toUpperCase()}>{children}</CADashboardShell>
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink">
      <header className="bg-white border-b-2 border-ink px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href={`/dashboard/${profile?.role}`}>
            <h1 className="text-xl font-bold tracking-tight">Vyapaar<span className="font-light">Sathi</span></h1>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-gray-100 px-3 py-1 rounded-sm border border-gray-200">
            <span className="text-gray-500">REF:</span>
            <span className="font-medium">{user.id.split('-')[0].toUpperCase()}</span>
          </div>
        </div>
        <DashboardHeaderControls role={profile?.role} />
      </header>
      <main className="flex-1 w-full relative">{children}</main>
    </div>
  )
}
