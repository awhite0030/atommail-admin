import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value, updated_at')
      .order('key');

    if (error) throw error;
    return NextResponse.json({ settings: data || [] });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('admin_settings')
      .upsert({
        key,
        value: String(value),
        updated_at: Date.now(),
      });

    if (error) throw error;

    // Аудит
    await supabaseAdmin.from('audit_log').insert({
      action: 'update_setting',
      details: { key, value },
      admin_email: user.email,
      created_at: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error updating setting:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
