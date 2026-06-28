'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, RefreshCw } from 'lucide-react';
import { formatTimestamp, timeAgo, truncateMiddle } from '@/lib/utils';

interface InboxRecord {
  address: string;
  created_at: number;
  expires_at: number;
  creator_ip_hash: string | null;
}

interface InboxResponse {
  inboxes: InboxRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export default function InboxesPage() {
  const [data, setData] = useState<InboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchInboxes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50', status });
    if (search) params.set('search', search);
    const res = await fetch(`/api/inboxes?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchInboxes(); }, [fetchInboxes]);

  const handleCleanup = async () => {
    if (!confirm('Удалить все истёкшие инбоксы?')) return;
    setCleanupLoading(true);
    try {
      const res = await fetch('/api/cleanup', { method: 'POST' });
      const data = await res.json();
      alert(`Удалено ${data.deleted} истёкших инбоксов`);
      fetchInboxes();
    } catch { alert('Ошибка очистки'); }
    setCleanupLoading(false);
  };

  const handleDelete = async (address: string) => {
    if (!confirm(`Удалить инбокс ${address} и все его письма?`)) return;
    setDeleting(address);
    await fetch(`/api/inboxes/${encodeURIComponent(address)}`, { method: 'DELETE' });
    setDeleting(null);
    fetchInboxes();
  };

  const now = Date.now();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Инбоксы</h2>
        <div className="flex gap-2">
          <a href="/api/export?table=inboxes" className="px-4 py-2 text-sm bg-white/5 border border-[var(--border)] rounded-lg hover:bg-white/10 transition">
            Экспорт CSV
          </a>
          <button
            onClick={handleCleanup}
            disabled={cleanupLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500/10 text-red-400 border border-red-800 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {cleanupLoading ? 'Очистка...' : 'Удалить истёкшие'}
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Поиск по адресу..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value as any); setPage(1); }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="all">Все</option>
          <option value="active">Активные</option>
          <option value="expired">Истёкшие</option>
        </select>
        <button onClick={fetchInboxes} className="p-2 hover:bg-white/5 rounded-lg transition">
          <RefreshCw className="w-4 h-4 text-[var(--muted)]" />
        </button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Адрес</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Создан</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Истекает</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Статус</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">IP-хэш</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">Загрузка...</td></tr>
            ) : !data?.inboxes.length ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">Инбоксы не найдены</td></tr>
            ) : (
              data.inboxes.map(inbox => {
                const isActive = inbox.expires_at > now;
                return (
                  <tr key={inbox.address} className="border-b border-[var(--border)] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs">{inbox.address}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">{timeAgo(inbox.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">{formatTimestamp(inbox.expires_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isActive ? 'Активен' : 'Истёк'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {inbox.creator_ip_hash ? truncateMiddle(inbox.creator_ip_hash, 12) : ''}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(inbox.address)}
                        disabled={deleting === inbox.address}
                        className="p-1 text-[var(--muted)] hover:text-red-400 transition disabled:opacity-50"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted)]">
            {data.total} всего — Страница {data.page} из {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-white/5 disabled:opacity-30"
            >
              Назад
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-white/5 disabled:opacity-30"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
