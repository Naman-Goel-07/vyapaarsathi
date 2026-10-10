import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UploadNotice from '@/components/UploadNotice'

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

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('business_id', profile.business_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-300 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-ink"></div>
        <div className="pl-4">
          <h2 className="text-2xl font-bold font-serif tracking-tight">Incoming Dispatches</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Upload notices for AI extraction and task delegation.</p>
        </div>
        <UploadNotice businessId={profile.business_id} />
      </div>

      {/* PHASE 4: THE PENALTY DESK */}
      <div className="bg-post-red/5 border border-post-red/20 rounded-sm p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-post-red"></div>
        <div className="space-y-1">
          <h3 className="text-post-red font-bold font-serif text-lg tracking-tight flex items-center gap-2">
            <span className="bg-post-red text-white text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider">Live</span>
            Penalty Exposure Calculator
          </h3>
          <p className="text-sm text-gray-700 font-medium">Tracking estimated ₹50/day late fees across all overdue compliance matters.</p>
        </div>
        <div className="flex items-center gap-8 bg-white px-6 py-3 rounded border border-post-red/10 shadow-sm">
          <div className="text-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider">At Risk</p>
            <p className="text-2xl font-bold text-post-red font-mono">₹450</p>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider">Overdue Files</p>
            <p className="text-xl font-bold text-ink font-mono">2</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notices?.length === 0 ? (
          <div className="col-span-full border border-dashed border-gray-300 rounded-sm p-12 text-center bg-gray-50">
             <p className="text-gray-500 font-medium">No notices currently logged in the registry.</p>
          </div>
        ) : (
          notices?.map((notice) => (
            <div key={notice.id} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 space-y-4 relative group hover:border-ink transition-colors">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <span className="font-mono text-sm font-semibold text-ink">{notice.authority}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${
                  notice.status === 'open' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                  notice.status === 'filed' ? 'bg-forest-green/10 text-forest-green border-forest-green/20' : 'bg-gray-50 text-gray-800 border-gray-200'
                }`}>
                  {notice.status === 'open' ? 'ACTION REQ' : notice.status}
                </span>
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
                  Access Case File <span className="font-mono text-gray-400 group-hover:text-ink transition-colors">-&gt;</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
