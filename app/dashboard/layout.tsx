import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogOut, ArrowLeftRight } from 'lucide-react'
import { switchRole } from '@/app/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const targetRole = profile?.role === 'owner' ? 'ca' : 'owner'
  const switchAction = switchRole.bind(null, targetRole)

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink">
      {/* Top bureaucratic header */}
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-2 py-1 bg-ink text-white rounded-sm uppercase tracking-wider">
              {profile?.role === 'ca' ? 'CA Bench' : 'Owner Desk'}
            </span>
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <form action={switchAction}>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-ink transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
              <ArrowLeftRight size={16} /> 
              <span className="hidden sm:inline">Switch to {profile?.role === 'owner' ? 'CA View' : 'Owner View'}</span>
            </button>
          </form>

          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-post-red transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      </header>
      
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  )
}
