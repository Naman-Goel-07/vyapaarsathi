import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LandingContent from '@/components/LandingContent';

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

  return <LandingContent />;
}
