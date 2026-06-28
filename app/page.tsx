'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already authenticated (has Supabase session), go to dashboard
    // Otherwise, stay on the landing page served by (store) route group
    const checkAuth = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        // No Supabase configured — dev mode, go straight to dashboard
        window.location.href = '/dashboard';
        return;
      }
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.location.href = '/dashboard';
        }
      } catch {
        // Stay on landing page
      }
    };
    checkAuth();
  }, []);

  if (!mounted) return null;

  // The landing page is rendered by the (store) route group's page.tsx
  // This page.tsx handles auth redirect; if no session, the (store) page renders
  return null;
}
