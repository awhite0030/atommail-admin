'use client';

import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabaseUrl || !supabaseKey) {
      setError('Supabase не настроен. Укажите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    const { createBrowserClient } = await import('@supabase/ssr');
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  };

  const inputClass =
    'w-full bg-surface border border-border rounded-pill pl-11 pr-5 min-h-12 py-3 text-sm text-ink placeholder:text-ink-dust focus:outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10 transition';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-light tracking-tight text-ink">atommail</h1>
          <p className="font-mono text-micro uppercase text-ink-dust mt-2">Панель администратора</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="border border-danger/40 bg-white text-danger px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dust" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dust" />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-flat w-full bg-ink text-white rounded-pill min-h-12 py-3 font-medium text-sm uppercase tracking-[0.08em] hover:bg-[#3a3435] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
