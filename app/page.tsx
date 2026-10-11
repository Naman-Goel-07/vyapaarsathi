import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'ca') {
      redirect('/dashboard/ca');
    } else {
      redirect('/dashboard/owner');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-paper text-ink">
      <div className="max-w-md w-full bg-white rounded-sm shadow-sm border-2 border-ink p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold font-serif text-ink tracking-tight">VyapaarSathi</h1>
        <p className="text-gray-600">
          The Government Action Tracker for MSMEs and Chartered Accountants.
          Never miss a compliance deadline again.
        </p>
        <div className="space-y-4 pt-4">
          <Link 
            href="/login" 
            className="block w-full bg-ink text-white font-semibold py-3 rounded-sm hover:bg-gray-800 transition shadow-sm"
          >
            Login to Dashboard
          </Link>
          <Link 
            href="/signup" 
            className="block w-full bg-white text-ink font-semibold py-3 rounded-sm hover:bg-gray-50 transition border border-gray-300 shadow-sm"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
