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

/* Mineral tones from the Paper & Ink spectrum */
const COLORS = ['#7a6f7d', '#5c6b74', '#4f7a72', '#a08a5f', '#a9797b'];
const INK = '#231f20';
const INK_MIST = '#6b6862';
const GRID = 'rgba(35, 31, 32, 0.08)';
const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid rgba(35, 31, 32, 0.15)',
  borderRadius: 10,
  color: INK,
  fontSize: 12,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-ink-mist text-sm">Загрузка статистики...</div>;
  if (!stats) return <div className="text-danger text-sm">Не удалось загрузить статистику</div>;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-light text-ink">Дашборд</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={Inbox} label="Всего инбоксов" value={stats.totalInboxes} sub={`${stats.inboxesToday} сегодня, ${stats.inboxesWeek} за неделю`} />
        <MetricCard icon={Mail} label="Всего писем" value={stats.totalEmails} sub={`${stats.emailsToday} сегодня, ${stats.emailsWeek} за неделю`} />
        <MetricCard icon={Clock} label="Активных сейчас" value={stats.activeInboxes} sub="не истёкших" />
        <MetricCard icon={Activity} label="Сегодня" value={stats.inboxesToday} sub={`${stats.emailsToday} писем`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card-elevated p-4">
          <h3 className="font-mono text-micro uppercase text-ink-dust mb-4">Инбоксы — Последние 7 дней</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.inboxesPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: INK_MIST }} stroke={GRID} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: INK_MIST }} stroke={GRID} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="count" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elevated p-4">
          <h3 className="font-mono text-micro uppercase text-ink-dust mb-4">Письма — Последние 7 дней</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.emailsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: INK_MIST }} stroke={GRID} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: INK_MIST }} stroke={GRID} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="count" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card-elevated xl:col-span-2 p-4">
          <h3 className="font-mono text-micro uppercase text-ink-dust mb-4">Инбоксы сегодня — по часам</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.inboxesByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: INK_MIST }} stroke={GRID} />
              <YAxis tick={{ fontSize: 11, fill: INK_MIST }} stroke={GRID} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill={COLORS[3]} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elevated p-4">
          <h3 className="font-mono text-micro uppercase text-ink-dust mb-4">Топ доменов отправителей</h3>
          {stats.topDomains.length === 0 ? (
            <p className="text-xs text-ink-mist">Пока нет данных о письмах</p>
          ) : (
            <div className="space-y-2">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={stats.topDomains} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {stats.topDomains.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {stats.topDomains.map((d, i) => (
                  <div key={d.domain} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-ink-mist">{d.domain}</span>
                    </div>
                    <span className="font-mono text-ink">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {stats.topIps.length > 0 && (
        <div className="card-elevated p-4">
          <h3 className="font-mono text-micro uppercase text-ink-dust mb-4">Топ IP-хэши (24ч)</h3>
          <div className="space-y-2">
            {stats.topIps.map((ip, i) => (
              <div key={ip.hash} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-ink-dust font-mono w-6">{i + 1}.</span>
                  <code className="text-xs bg-ink/[0.05] px-2 py-0.5 rounded text-ink">{ip.hash}</code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-ink/[0.08] rounded-full h-2">
                    <div className="bg-danger h-2 rounded-full" style={{ width: `${Math.min(100, (ip.count / 20) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono w-8 text-right text-ink">{ip.count}</span>
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
    <div className="card-elevated p-4 sm:p-5">
      <div className="flex items-center gap-2 text-ink-dust mb-2">
        <Icon className="w-4 h-4" />
        <span className="font-mono text-micro uppercase">{label}</span>
      </div>
      <div className="font-display text-3xl font-light text-ink">{value.toLocaleString('ru-RU')}</div>
      <div className="text-xs text-ink-mist mt-1">{sub}</div>
    </div>
  );
}
