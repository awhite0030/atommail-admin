'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Trash2, Eye, X } from 'lucide-react';
import { timeAgo, truncateMiddle, formatTimestamp } from '@/lib/utils';

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
        <h2 className="text-2xl font-bold">Письма</h2>
        <button onClick={handleExport} className="px-4 py-2 text-sm bg-white/5 border border-[var(--border)] rounded-lg hover:bg-white/10 transition">
          Экспорт CSV
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Поиск по отправителю, получателю, теме..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30"
          />
        </div>
        <button onClick={fetchEmails} className="p-2 hover:bg-white/5 rounded-lg transition">
          <RefreshCw className="w-4 h-4 text-[var(--muted)]" />
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
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">Загрузка...</td></tr>
            ) : !data?.emails.length ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">Письма не найдены</td></tr>
            ) : (
              data.emails.map(email => (
                <tr key={email.id} className="border-b border-[var(--border)] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{email.id}</td>
                  <td className="px-4 py-3 text-xs font-mono">{truncateMiddle(email.sender, 24)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[var(--muted)]">{truncateMiddle(email.recipient, 24)}</td>
                  <td className="px-4 py-3 text-xs truncate max-w-[200px]">{email.subject || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{timeAgo(email.received_at)}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => handleView(email.id)} className="p-1 text-[var(--muted)] hover:text-white transition" title="Просмотр">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(email.id)} disabled={deleting === email.id} className="p-1 text-[var(--muted)] hover:text-red-400 transition disabled:opacity-50" title="Удалить">
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-white/5 disabled:opacity-30">Назад</button>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-white/5 disabled:opacity-30">Вперёд</button>
          </div>
        </div>
      )}

      {/* Модалка просмотра письма */}
      {viewing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-4">
              <button onClick={() => setViewing(null)} className="p-1 text-[var(--muted)] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-2">{viewing.subject || '(без темы)'}</h2>
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
