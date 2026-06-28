'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Mail, Shield, Ban, ScrollText, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/dashboard/inboxes', label: 'Инбоксы', icon: Inbox },
  { href: '/dashboard/emails', label: 'Письма', icon: Mail },
  { href: '/dashboard/abuse', label: 'Злоупотребления', icon: Shield },
  { href: '/dashboard/bans', label: 'Блокировки', icon: Ban },
  { href: '/dashboard/log', label: 'Журнал', icon: ScrollText },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Боковая панель */}
      <aside className="w-56 bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="text-lg font-bold tracking-tight">AtomMail</h1>
          <p className="text-xs text-[var(--muted)]">Панель администратора</p>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-[var(--border)]">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition w-full"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </form>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
