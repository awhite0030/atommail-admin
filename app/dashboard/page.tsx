'use client';

import { useState, useEffect } from 'react';
import { Inbox, Mail, Clock, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

interface Stats {
  totalInboxes: number;
  totalEmails: number;
  inboxesToday: number;
  emailsToday: number;
  inboxesWeek: number;
  emailsWeek: number;
  activeInboxes: number;
  inboxesPerDay: { date: string; count: number }[];
  emailsPerDay: { date: string; count: number }[];
  inboxesByHour: { hour: string; count: number }[];
  topDomains: { domain: string; count: number }[];
  topIps: { hash: string; count: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[var(--muted)] text-sm">Загрузка статистики...</div>;
  if (!stats) return <div className="text-red-400 text-sm">Не удалось загрузить статистику</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Дашборд</h2>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={Inbox} label="Всего инбоксов" value={stats.totalInboxes} sub={`${stats.inboxesToday} сегодня, ${stats.inboxesWeek} за неделю`} />
        <MetricCard icon={Mail} label="Всего писем" value={stats.totalEmails} sub={`${stats.emailsToday} сегодня, ${stats.emailsWeek} за неделю`} />
        <MetricCard icon={Clock} label="Активных сейчас" value={stats.activeInboxes} sub="не истёкших" />
        <MetricCard icon={Activity} label="Сегодня" value={stats.inboxesToday} sub={`${stats.emailsToday} писем`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Инбоксы — Последние 7 дней</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.inboxesPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#555" tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} stroke="#555" />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Письма — Последние 7 дней</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.emailsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#555" tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} stroke="#555" />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Инбоксы сегодня — по часам</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.inboxesByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#555" />
              <YAxis tick={{ fontSize: 11 }} stroke="#555" />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#ffc658" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Топ доменов отправителей</h3>
          {stats.topDomains.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">Пока нет данных о письмах</p>
          ) : (
            <div className="space-y-2">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={stats.topDomains} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {stats.topDomains.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {stats.topDomains.map((d, i) => (
                  <div key={d.domain} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[var(--muted)]">{d.domain}</span>
                    </div>
                    <span className="font-mono">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {stats.topIps.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Топ IP-хэши (24ч)</h3>
          <div className="space-y-2">
            {stats.topIps.map((ip, i) => (
              <div key={ip.hash} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)] font-mono w-6">{i + 1}.</span>
                  <code className="text-xs bg-white/5 px-2 py-0.5 rounded">{ip.hash}</code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-white/5 rounded-full h-2">
                    <div className="bg-[var(--danger)] h-2 rounded-full" style={{ width: `${Math.min(100, (ip.count / 20) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono w-8 text-right">{ip.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number; sub: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center gap-2 text-[var(--muted)] mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString('ru-RU')}</div>
      <div className="text-xs text-[var(--muted)] mt-1">{sub}</div>
    </div>
  );
}
