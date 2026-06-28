import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || '';
  const sender = searchParams.get('sender') || '';
  const recipient = searchParams.get('recipient') || '';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabaseAdmin
      .from('emails')
      .select('id, sender, recipient, subject, received_at', { count: 'exact' })
      .order('received_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`sender.ilike.%${search}%,recipient.ilike.%${search}%,subject.ilike.%${search}%`);
    }
    if (sender) {
      query = query.ilike('sender', `%${sender}%`);
    }
    if (recipient) {
      query = query.ilike('recipient', `%${recipient}%`);
    }

    const { data, count } = await query;

    return NextResponse.json({
      emails: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Error fetching emails:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
