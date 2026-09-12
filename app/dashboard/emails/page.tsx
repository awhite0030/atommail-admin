'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Trash2, Eye, X } from 'lucide-react';
import { timeAgo, truncateMiddle, formatTimestamp } from '@/lib/utils';
import { SkeletonRows } from '@/lib/motion';

interface EmailRecord {
  id: number;
  sender: string;
  recipient: string;
  subject: string | null;
  received_at: number;
  body_text?: string;
  body_html?: string;
}

interface EmailResponse {
  emails: EmailRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export default function EmailsPage() {
  const [data, setData] = useState<EmailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<EmailRecord | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/emails?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const handleView = async (id: number) => {
    const res = await fetch(`/api/email/${id}`);
    const email = await res.json();
    setViewing(email);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это письмо?')) return;
    setDeleting(id);
    await fetch(`/api/emails/${id}`, { method: 'DELETE' });
    setDeleting(null);
    fetchEmails();
  };

  const handleExport = () => {
    window.open('/api/emails/export?format=csv', '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-light text-ink">Письма</h2>
        <button onClick={handleExport} className="min-h-11 px-5 py-2 text-sm bg-ink/[0.05] border border-border rounded-pill hover:bg-ink/[0.10] transition">
          Экспорт CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-md min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dust" />
          <input
            type="text"
            placeholder="Поиск по отправителю, получателю, теме..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-surface border border-border rounded-pill pl-10 pr-4 min-h-11 py-2 text-sm focus:outline-none focus:border-ink/40"
          />
        </div>
        <button onClick={fetchEmails} aria-label="Обновить" className="grid min-h-11 w-11 place-items-center hover:bg-ink/[0.05] rounded-pill transition">
          <RefreshCw className="w-4 h-4 text-ink-dust" />
        </button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium w-16">ID</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Отправитель</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Получатель</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Тема</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Получено</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-0"><SkeletonRows count={6} className="space-y-2 p-4" /></td></tr>
            ) : !data?.emails.length ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">Письма не найдены</td></tr>
            ) : (
              data.emails.map(email => (
                <tr key={email.id} className="border-b border-[var(--border)] hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{email.id}</td>
                  <td className="px-4 py-3 text-xs font-mono">{truncateMiddle(email.sender, 24)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[var(--muted)]">{truncateMiddle(email.recipient, 24)}</td>
                  <td className="px-4 py-3 text-xs truncate max-w-[200px]">{email.subject || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{timeAgo(email.received_at)}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => handleView(email.id)} className="grid min-h-9 w-9 place-items-center text-ink-dust hover:text-ink transition" title="Просмотр">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(email.id)} disabled={deleting === email.id} className="grid min-h-9 w-9 place-items-center text-ink-dust hover:text-danger transition disabled:opacity-50" title="Удалить">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="min-h-9 px-4 py-1.5 text-xs bg-surface border border-border rounded-pill hover:bg-ink/[0.05] disabled:opacity-30">Назад</button>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="min-h-9 px-4 py-1.5 text-xs bg-surface border border-border rounded-pill hover:bg-ink/[0.05] disabled:opacity-30">Вперёд</button>
          </div>
        </div>
      )}

      {/* Модалка просмотра письма */}
      {viewing && (
        <div className="fixed inset-0 bg-ink/25 backdrop-blur-[4px] flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
          <div className="bg-surface border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-[0_24px_80px_-32px_rgba(35,31,32,0.4)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-4">
              <button onClick={() => setViewing(null)} aria-label="Закрыть" className="grid min-h-11 w-11 place-items-center rounded-pill text-ink-dust hover:text-ink hover:bg-ink/[0.05] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="font-display text-xl font-light text-ink mb-2">{viewing.subject || '(без темы)'}</h2>
            <div className="text-[var(--muted)] text-sm mb-4">
              От: {viewing.sender} · Получатель: {viewing.recipient} · {formatTimestamp(viewing.received_at)}
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              {viewing.body_html ? (
                <iframe
                  srcDoc={viewing.body_html}
                  className="w-full h-96 rounded-lg border border-[var(--border)]"
                  sandbox="allow-same-origin"
                  title="Содержимое письма"
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm">{viewing.body_text || 'Нет содержимого'}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
