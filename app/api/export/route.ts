import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const table = searchParams.get('table') || 'emails';

  if (table === 'emails') {
    const { data } = await supabaseAdmin
      .from('emails')
      .select('id, sender, recipient, subject, received_at')
      .order('received_at', { ascending: false })
      .limit(10000);

    const csv = [
      'ID,Отправитель,Получатель,Тема,Получено',
      ...(data || []).map(e =>
        `${e.id},"${(e.sender || '').replace(/"/g, '""')}","${(e.recipient || '').replace(/"/g, '""')}","${(e.subject || '').replace(/"/g, '""')}",${new Date(e.received_at).toISOString()}`
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="emails.csv"',
      },
    });
  }

  if (table === 'inboxes') {
    const { data } = await supabaseAdmin
      .from('inboxes')
      .select('address, created_at, expires_at, creator_ip_hash')
      .order('created_at', { ascending: false })
      .limit(10000);

    const csv = [
      'Адрес,Создан,Истекает,IP-хэш',
      ...(data || []).map(i =>
        `"${i.address}",${new Date(i.created_at).toISOString()},${new Date(i.expires_at).toISOString()},"${i.creator_ip_hash || ''}"`
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="inboxes.csv"',
      },
    });
  }

  return NextResponse.json({ error: 'Unknown table' }, { status: 400 });
}
