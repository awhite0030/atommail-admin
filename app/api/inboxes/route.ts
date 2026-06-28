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
  const status = searchParams.get('status') || 'all'; // all, active, expired

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const now = Date.now();

  try {
    let query = supabaseAdmin
      .from('inboxes')
      .select('address, created_at, expires_at, creator_ip_hash', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike('address', `%${search}%`);
    }

    if (status === 'active') {
      query = query.gt('expires_at', now);
    } else if (status === 'expired') {
      query = query.lt('expires_at', now);
    }

    const { data, count } = await query;

    return NextResponse.json({
      inboxes: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Error fetching inboxes:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
