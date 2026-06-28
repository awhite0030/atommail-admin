import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const emailId = parseInt(id, 10);

  const { data, error } = await supabaseAdmin
    .from('emails')
    .select('id, sender, recipient, subject, body_text, body_html, received_at')
    .eq('id', emailId)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Письмо не найдено' }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const emailId = parseInt(id, 10);

  const { error } = await supabaseAdmin.from('emails').delete().eq('id', emailId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('audit_log').insert({
    action: 'delete_email',
    details: { email_id: emailId },
    admin_email: user.email,
    created_at: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
