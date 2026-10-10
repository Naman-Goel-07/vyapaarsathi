import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-ink"></div>
        <div className="pl-4">
          <h2 className="text-2xl font-bold font-serif tracking-tight">Active Docket</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Registry of pending actions and compliance matters across all clients.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notices?.length === 0 ? (
          <div className="col-span-full border border-dashed border-gray-300 rounded-sm p-12 text-center bg-gray-50">
             <p className="text-gray-500 font-medium">The docket is clear.</p>
          </div>
        ) : (
          notices?.map((notice) => (
            <div key={notice.id} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 space-y-4 relative group hover:border-ink transition-colors">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <span className="text-xs font-mono font-bold tracking-wider text-gray-500">{(notice.businesses as any)?.name?.toUpperCase() || 'UNKNOWN CLIENT'}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${
                  notice.status === 'open' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                  notice.status === 'filed' ? 'bg-forest-green/10 text-forest-green border-forest-green/20' : 'bg-gray-50 text-gray-800 border-gray-200'
                }`}>
                  {notice.status === 'open' ? 'PENDING' : notice.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Authority / Dept</p>
                <h3 className="font-mono text-sm font-semibold text-ink">{notice.authority}</h3>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Subject</p>
                <p className="text-sm font-medium line-clamp-2 leading-relaxed">{notice.issue}</p>
              </div>
              {notice.deadline && (
                <div className="space-y-1">
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Deadline</p>
                   <p className="text-sm text-post-red font-bold font-mono">{notice.deadline}</p>
                </div>
              )}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link href={`/dashboard/notices/${notice.id}`} className="text-sm font-bold text-ink hover:underline flex items-center gap-2">
                  Review Case File <span className="font-mono text-gray-400 group-hover:text-ink transition-colors">-&gt;</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
