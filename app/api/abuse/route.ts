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

    // Top IP hashes with most inboxes (last 24h)
    const { data: recentInboxes } = await supabaseAdmin
      .from('inboxes')
      .select('creator_ip_hash, created_at')
      .gt('created_at', now - dayMs);

    const ipMap: Record<string, { count: number; inboxes: { address: string; created_at: number }[] }> = {};
    (recentInboxes || []).forEach(i => {
      if (!i.creator_ip_hash) return;
      if (!ipMap[i.creator_ip_hash]) {
        ipMap[i.creator_ip_hash] = { count: 0, inboxes: [] };
      }
      ipMap[i.creator_ip_hash].count++;
    });

    // Get addresses for top IPs
    const topIps = Object.entries(ipMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    const topIpsWithData = await Promise.all(
      topIps.map(async ([hash, info]) => {
        const { data } = await supabaseAdmin
          .from('inboxes')
          .select('address, created_at, expires_at')
          .eq('creator_ip_hash', hash)
          .order('created_at', { ascending: false })
          .limit(20);

        return {
          hash,
          count: info.count,
          inboxes: data || [],
        };
      })
    );

    // All-time top IPs
    const { data: allInboxes } = await supabaseAdmin
      .from('inboxes')
      .select('creator_ip_hash');

    const allIpMap: Record<string, number> = {};
    (allInboxes || []).forEach(i => {
      if (i.creator_ip_hash) {
        allIpMap[i.creator_ip_hash] = (allIpMap[i.creator_ip_hash] || 0) + 1;
      }
    });

    const allTimeTopIps = Object.entries(allIpMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([hash, count]) => ({ hash, count }));

    // IPs near the daily limit (>= 15 inboxes in 24h)
    const nearLimitIps = topIps
      .filter(([_, info]) => info.count >= 15)
      .map(([hash, info]) => ({ hash, count: info.count }));

    return NextResponse.json({
      topIps24h: topIpsWithData,
      allTimeTopIps,
      nearLimitIps,
    });
  } catch (err) {
    console.error('Error fetching abuse data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
