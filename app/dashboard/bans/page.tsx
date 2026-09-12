'use client';

import { useState, useEffect } from 'react';
import { Ban, Unlock, Plus } from 'lucide-react';
import { formatTimestamp, truncateMiddle } from '@/lib/utils';

interface BannedIp {
  ip_hash: string;
  reason: string;
  banned_at: number;
  banned_by: string;
}

export default function BansPage() {
  const [bans, setBans] = useState<BannedIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newHash, setNewHash] = useState('');
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchBans = async () => {
    setLoading(true);
    const res = await fetch('/api/bans');
    const data = await res.json();
    setBans(data.bans || []);
    setLoading(false);
  };

  useEffect(() => { fetchBans(); }, []);

  const handleBan = async () => {
    if (!newHash.trim()) return;
    setAdding(true);
    await fetch('/api/bans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip_hash: newHash.trim(), reason: newReason.trim() }),
    });
    setNewHash('');
    setNewReason('');
    setShowAdd(false);
    setAdding(false);
    fetchBans();
  };

  const handleUnban = async (hash: string) => {
    if (!confirm(`Разблокировать IP-хэш ${truncateMiddle(hash, 12)}?`)) return;
    await fetch(`/api/bans?ip_hash=${encodeURIComponent(hash)}`, { method: 'DELETE' });
    fetchBans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ban className="w-6 h-6 text-danger" />
          <h2 className="font-display text-3xl font-light text-ink">Блокировки</h2>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 min-h-11 px-5 py-2 text-sm bg-ink text-white rounded-pill uppercase tracking-[0.08em] hover:bg-[#3a3435] transition"
        >
          <Plus className="w-4 h-4" />
          Добавить бан
        </button>
      </div>

      {showAdd && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-sm">Новая блокировка</h3>
          <input
            type="text"
            placeholder="IP-хэш (32 символа)"
            value={newHash}
            onChange={e => setNewHash(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-ink/40"
          />
          <input
            type="text"
            placeholder="Причина (необязательно)"
            value={newReason}
            onChange={e => setNewReason(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink/40"
          />
          <div className="flex gap-2">
            <button
              onClick={handleBan}
              disabled={adding || !newHash.trim()}
              className="min-h-11 px-5 py-2 text-sm bg-danger/10 text-danger border border-danger/40 rounded-pill hover:bg-danger/20 transition disabled:opacity-50"
            >
              {adding ? 'Блокировка...' : 'Заблокировать'}
            </button>
            <button onClick={() => setShowAdd(false)} className="min-h-11 px-5 py-2 text-sm bg-ink/[0.05] rounded-pill hover:bg-ink/[0.10] transition">
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">IP-хэш</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Причина</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Заблокирован</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Кем</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">Загрузка...</td></tr>
            ) : bans.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">Нет заблокированных IP</td></tr>
            ) : (
              bans.map(ban => (
                <tr key={ban.ip_hash} className="border-b border-[var(--border)] hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs">{ban.ip_hash}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{ban.reason || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{formatTimestamp(ban.banned_at)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{ban.banned_by || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUnban(ban.ip_hash)}
                      className="flex items-center gap-1 min-h-9 px-3 py-1 text-xs bg-success/10 text-success rounded-pill hover:bg-success/20 transition"
                      title="Разблокировать"
                    >
                      <Unlock className="w-3 h-3" /> Разбан
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
