import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    // Total counts
    const { count: totalInboxes } = await supabaseAdmin
      .from('inboxes')
      .select('*', { count: 'exact', head: true });

    const { count: totalEmails } = await supabaseAdmin
      .from('emails')
      .select('*', { count: 'exact', head: true });

    // Today
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const { count: inboxesToday } = await supabaseAdmin
      .from('inboxes')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', todayStart);

    const { count: emailsToday } = await supabaseAdmin
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .gt('received_at', todayStart);

    // This week
    const weekStart = now - weekMs;
    const { count: inboxesWeek } = await supabaseAdmin
      .from('inboxes')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', weekStart);

    const { count: emailsWeek } = await supabaseAdmin
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .gt('received_at', weekStart);

    // Active inboxes
    const { count: activeInboxes } = await supabaseAdmin
      .from('inboxes')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', now);

    // Inboxes per day (last 7 days) — raw data
    const { data: inboxesByDay } = await supabaseAdmin
      .from('inboxes')
      .select('created_at')
      .gt('created_at', weekStart)
      .order('created_at', { ascending: true });

    // Emails per day (last 7 days)
    const { data: emailsByDay } = await supabaseAdmin
      .from('emails')
      .select('received_at')
      .gt('received_at', weekStart)
      .order('received_at', { ascending: true });

    // Aggregate by day
    const inboxesPerDay = aggregateByDay(inboxesByDay || [], 'created_at', weekStart);
    const emailsPerDay = aggregateByDay(emailsByDay || [], 'received_at', weekStart);

    // Top sender domains
    const { data: recentEmails } = await supabaseAdmin
      .from('emails')
      .select('sender')
      .gt('received_at', weekStart);

    const domainCounts: Record<string, number> = {};
    (recentEmails || []).forEach(e => {
      const domain = e.sender.split('@')[1] || 'unknown';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    // Top IP hashes (last 24h)
    const { data: recentInboxes } = await supabaseAdmin
      .from('inboxes')
      .select('creator_ip_hash')
      .gt('created_at', now - dayMs);

    const ipCounts: Record<string, number> = {};
    (recentInboxes || []).forEach(i => {
      if (i.creator_ip_hash) {
        ipCounts[i.creator_ip_hash] = (ipCounts[i.creator_ip_hash] || 0) + 1;
      }
    });
    const topIps = Object.entries(ipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([hash, count]) => ({ hash, count }));

    // Inboxes by hour today
    const inboxesByHour = aggregateByHour(inboxesByDay || [], 'created_at', todayStart);

    return NextResponse.json({
      totalInboxes: totalInboxes || 0,
      totalEmails: totalEmails || 0,
      inboxesToday: inboxesToday || 0,
      emailsToday: emailsToday || 0,
      inboxesWeek: inboxesWeek || 0,
      emailsWeek: emailsWeek || 0,
      activeInboxes: activeInboxes || 0,
      inboxesPerDay,
      emailsPerDay,
      inboxesByHour,
      topDomains,
      topIps,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function aggregateByDay(data: { [key: string]: number }[], field: string, since: number) {
  const days: Record<string, number> = {};
  // Initialize all 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    days[key] = 0;
  }
  data.forEach(item => {
    const date = new Date(item[field] as number);
    const key = date.toISOString().split('T')[0];
    if (days[key] !== undefined) days[key]++;
  });
  return Object.entries(days).map(([date, count]) => ({ date, count }));
}

function aggregateByHour(data: { [key: string]: number }[], field: string, since: number) {
  const hours: Record<string, number> = {};
  for (let i = 0; i < 24; i++) {
    hours[String(i).padStart(2, '0')] = 0;
  }
  (data as any[]).filter(item => item[field] >= since).forEach(item => {
    const date = new Date(item[field] as number);
    const key = String(date.getHours()).padStart(2, '0');
    if (hours[key] !== undefined) hours[key]++;
  });
  return Object.entries(hours).map(([hour, count]) => ({ hour, count }));
}
