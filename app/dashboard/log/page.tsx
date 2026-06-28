'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

interface AuditEntry {
  id: number;
  action: string;
  details: any;
  admin_email: string;
  created_at: number;
}

interface LogResponse {
  logs: AuditEntry[];
  total: number;
  page: number;
  totalPages: number;
}

const ACTION_LABELS: Record<string, string> = {
  ban_ip: 'Блокировка IP',
  unban_ip: 'Разблокировка IP',
  delete_email: 'Удаление письма',
  delete_inbox: 'Удаление инбокса',
  update_setting: 'Изменение настройки',
  cleanup: 'Очистка истёкших',
};

export default function LogPage() {
  const [data, setData] = useState<LogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');

  const fetchLog = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (action) params.set('action', action);
    const res = await fetch(`/api/log?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, action]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const formatDetails = (entry: AuditEntry): string => {
    const d = entry.details;
    if (!d) return '—';
    if (entry.action === 'ban_ip' || entry.action === 'unban_ip') return `IP: ${d.ip_hash?.slice(0, 12)}...`;
    if (entry.action === 'delete_email') return `Письмо #${d.email_id}`;
    if (entry.action === 'delete_inbox') return d.address || '—';
    if (entry.action === 'update_setting') return `${d.key}: ${d.value}`;
    if (entry.action === 'cleanup') return `Удалено: ${d.deleted || '?'}`;
    return JSON.stringify(d);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Журнал действий</h2>
        </div>
        <button onClick={fetchLog} className="p-2 hover:bg-white/5 rounded-lg transition">
          <RefreshCw className="w-4 h-4 text-[var(--muted)]" />
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1); }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">Все действия</option>
          <option value="ban_ip">Блокировка IP</option>
          <option value="unban_ip">Разблокировка IP</option>
          <option value="delete_email">Удаление письма</option>
          <option value="delete_inbox">Удаление инбокса</option>
          <option value="update_setting">Изменение настройки</option>
          <option value="cleanup">Очистка</option>
        </select>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Действие</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Детали</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Администратор</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Время</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">Загрузка...</td></tr>
            ) : !data?.logs.length ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">Записей нет</td></tr>
            ) : (
              data.logs.map(entry => (
                <tr key={entry.id} className="border-b border-[var(--border)] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5">
                      {ACTION_LABELS[entry.action] || entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{formatDetails(entry)}</td>
                  <td className="px-4 py-3 text-xs">{entry.admin_email || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{formatTimestamp(entry.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted)]">
            {data.total} записей — Страница {data.page} из {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-white/5 disabled:opacity-30">Назад</button>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-white/5 disabled:opacity-30">Вперёд</button>
          </div>
        </div>
      )}
    </div>
  );
}
