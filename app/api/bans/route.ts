import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('banned_ips')
    .select('*')
    .order('banned_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bans: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { ip_hash, reason } = body;
  if (!ip_hash) return NextResponse.json({ error: 'ip_hash required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('banned_ips').insert({
    ip_hash,
    reason: reason || '',
    banned_at: Date.now(),
    banned_by: user.email || 'admin',
  });

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'IP уже заблокирован' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Аудит
  await supabaseAdmin.from('audit_log').insert({
    action: 'ban_ip',
    details: { ip_hash, reason },
    admin_email: user.email,
    created_at: Date.now(),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const ip_hash = searchParams.get('ip_hash');
  if (!ip_hash) return NextResponse.json({ error: 'ip_hash required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('banned_ips').delete().eq('ip_hash', ip_hash);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('audit_log').insert({
    action: 'unban_ip',
    details: { ip_hash },
    admin_email: user.email,
    created_at: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
