'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { addDocument } from '@/lib/db';

export function PageTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const prevPath = useRef<string>('');

  useEffect(() => {
    if (!user || pathname === prevPath.current) return;
    prevPath.current = pathname;

    addDocument('user_activity', {
      user_id: user.uid,
      user_email: user.email,
      page: pathname,
      action: 'page_view',
    }).catch(() => {});
  }, [pathname, user]);

  return null;
}
