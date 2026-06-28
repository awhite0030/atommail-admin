'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Ban } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatTimestamp } from '@/lib/utils';

interface IpInbox { address: string; created_at: number; expires_at: number }
interface TopIp24h { hash: string; count: number; inboxes: IpInbox[] }
interface AllTimeIp { hash: string; count: number }
interface NearLimitIp { hash: string; count: number }
interface AbuseData { topIps24h: TopIp24h[]; allTimeTopIps: AllTimeIp[]; nearLimitIps: NearLimitIp[] }

export default function AbusePage() {
  const [data, setData] = useState<AbuseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIp, setExpandedIp] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/abuse')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[var(--muted)] text-sm">Загрузка данных...</div>;
  if (!data) return <div className="text-red-400 text-sm">Не удалось загрузить данные</div>;

  const chartData = data.topIps24h.map(ip => ({ hash: ip.hash.slice(0, 8) + '...', count: ip.count }));

  const handleBan = async (hash: string) => {
    if (!confirm(`Заблокировать IP-хэш ${hash.slice(0, 12)}...? Все запросы с этого IP будут отклонены.`)) return;
    await fetch('/api/bans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip_hash: hash, reason: 'Превышение лимита инбоксов' }),
    });
    alert('IP-хэш заблокирован');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-[var(--danger)]" />
        <h2 className="text-2xl font-bold">Злоупотребления</h2>
      </div>

      {data.nearLimitIps.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {data.nearLimitIps.length} IP-хэш{data.nearLimitIps.length > 1 ? 'ей' : ''} около дневного лимита (15+ инбоксов за 24ч)
            </span>
          </div>
          <div className="space-y-1">
            {data.nearLimitIps.map(ip => (
              <div key={ip.hash} className="flex items-center justify-between text-sm">
                <code className="text-xs bg-white/5 px-2 py-0.5 rounded">{ip.hash}</code>
                <span className="text-red-400 font-mono text-xs">{ip.count}/20</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Топ IP-хэшей — Последние 24 часа</h3>
        {chartData.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">Нет данных</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#555" />
              <YAxis dataKey="hash" type="category" tick={{ fontSize: 10 }} stroke="#555" width={80} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Детали по IP-хэшам (24ч)</h3>
        <div className="space-y-3">
          {data.topIps24h.map(ip => (
            <div key={ip.hash} className="border border-[var(--border)] rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedIp(expandedIp === ip.hash ? null : ip.hash)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition text-left"
              >
                <div className="flex items-center gap-3">
                  <code className="text-xs bg-white/5 px-2 py-0.5 rounded">{ip.hash}</code>
                  <span className="text-xs text-[var(--muted)]">{ip.count} инбокс{ip.count !== 1 ? 'ов' : ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); handleBan(ip.hash); }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition"
                  >
                    <Ban className="w-3 h-3" /> Бан
                  </button>
                  <span className="text-xs text-[var(--muted)]">
                    {expandedIp === ip.hash ? 'Свернуть' : 'Развернуть'}
                  </span>
                </div>
              </button>
              {expandedIp === ip.hash && (
                <div className="border-t border-[var(--border)] px-4 py-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[var(--muted)]">
                        <th className="text-left py-1">Адрес</th>
                        <th className="text-left py-1">Создан</th>
                        <th className="text-left py-1">Истекает</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ip.inboxes.map(inbox => (
                        <tr key={inbox.address} className="border-t border-[var(--border)]">
                          <td className="py-1 font-mono">{inbox.address}</td>
                          <td className="py-1 text-[var(--muted)]">{formatTimestamp(inbox.created_at)}</td>
                          <td className="py-1 text-[var(--muted)]">{formatTimestamp(inbox.expires_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Топ IP-хэшей за всё время</h3>
        <div className="space-y-2">
          {data.allTimeTopIps.map((ip, i) => (
            <div key={ip.hash} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)] font-mono w-6">{i + 1}.</span>
                <code className="text-xs bg-white/5 px-2 py-0.5 rounded">{ip.hash}</code>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-white/5 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, (ip.count / Math.max(...data.allTimeTopIps.map(x => x.count))) * 100)}%` }} />
                </div>
                <span className="text-xs font-mono w-8 text-right">{ip.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
