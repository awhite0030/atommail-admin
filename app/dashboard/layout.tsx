'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageIn } from '@/lib/motion';
import { LayoutDashboard, Inbox, Mail, Shield, Ban, ScrollText, Settings, LogOut, Menu } from 'lucide-react';
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

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-2 space-y-1">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'relative flex items-center gap-3 min-h-11 px-3 py-2 rounded-pill text-sm transition-colors',
              isActive
                ? 'text-white font-medium'
                : 'text-ink-mist hover:text-ink hover:bg-ink/[0.05]'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-pill bg-ink"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className="relative w-4 h-4" />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="POST" className={className}>
      <button
        type="submit"
        className="flex items-center gap-3 min-h-11 w-full px-3 py-2 rounded-pill text-sm text-ink-mist hover:text-danger hover:bg-danger/10 transition"
      >
        <LogOut className="w-4 h-4" />
        Выйти
      </button>
    </form>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Мобильная шапка */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <Link href="/dashboard" className="font-display text-lg text-ink">
          atommail <span className="font-mono text-micro uppercase text-ink-dust">admin</span>
        </Link>
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Меню"
          aria-expanded={menuOpen}
          className="grid min-h-11 w-11 place-items-center rounded-pill text-ink-mist hover:bg-ink/[0.05]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:hidden overflow-hidden border-b border-border bg-card px-2 py-2"
        >
          <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          <LogoutButton className="p-2 pt-0" />
        </motion.div>
      )}

      {/* Боковая панель (десктоп) */}
      <aside className="hidden lg:flex w-56 bg-card border-r border-border flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="font-display text-lg text-ink">
            atommail
          </Link>
          <p className="font-mono text-micro uppercase text-ink-dust">Панель администратора</p>
        </div>

        <NavLinks pathname={pathname} />

        <LogoutButton className="p-2 border-t border-border" />
      </aside>

      {/* Основной контент */}
      <main className="flex-1 overflow-auto">
        <PageIn className="p-4 sm:p-6 max-w-7xl">
          {children}
        </PageIn>
      </main>
    </div>
  );
}
