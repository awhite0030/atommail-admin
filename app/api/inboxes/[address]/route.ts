import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { address } = await params;
  const addr = decodeURIComponent(address);

  const { error } = await supabaseAdmin.from('inboxes').delete().eq('address', addr);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('audit_log').insert({
    action: 'delete_inbox',
    details: { address: addr },
    admin_email: user.email,
    created_at: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
