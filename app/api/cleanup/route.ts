import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('cleanup_expired_inboxes');

    if (error) {
      console.error('Cleanup error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabaseAdmin.from('audit_log').insert({
      action: 'cleanup',
      details: { deleted: data },
      admin_email: user.email,
      created_at: Date.now(),
    });

    return NextResponse.json({ deleted: data });
  } catch (err) {
    console.error('Error running cleanup:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
