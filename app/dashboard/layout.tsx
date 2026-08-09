'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  Wallet,
  Receipt,
  LifeBuoy,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Order', href: '/dashboard/new-order', icon: PlusCircle },
  { label: 'Orders', href: '/dashboard/orders', icon: ListOrdered },
  { label: 'Add Funds', href: '/dashboard/add-funds', icon: Wallet },
  { label: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { label: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface ExtendedProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'provider';
  user_code: string;
  wallet_balance: number;
  full_name?: string;
  company?: string;
  avatar_url?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);

  // Auth guard
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, [user, loading, router]);

  // Fetch extended profile (full_name, company, avatar_url)
  const fetchExtendedProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, email, role, user_code, wallet_balance, full_name, company, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    if (data) setExtendedProfile(data as ExtendedProfile);
  }, [user]);

  useEffect(() => {
    if (user) fetchExtendedProfile();
  }, [user, fetchExtendedProfile]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, title, message, type, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data as NotificationItem[]);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logged out', description: 'You have been signed out successfully.' });
    router.replace('/login');
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const displayName =
    extendedProfile?.full_name ||
    profile?.email?.split('@')[0] ||
    user?.email?.split('@')[0] ||
    'User';
  const walletBalance = extendedProfile?.wallet_balance ?? profile?.wallet_balance ?? 0;
  const initials = displayName.charAt(0).toUpperCase();

  if (loading || !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-sky-500">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          GMB<span className="text-teal-500">CLEANER</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Wallet balance card */}
      <div className="px-3 pb-4">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
          <p className="text-xs font-medium text-slate-400">Wallet Balance</p>
          <p className="mt-1 text-2xl font-bold text-white">
            ${walletBalance.toFixed(2)}
          </p>
          <Link
            href="/dashboard/add-funds"
            onClick={() => setMobileOpen(false)}
            className="mt-3 block rounded-lg bg-teal-500 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-teal-600"
          >
            Add Funds
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl lg:px-8">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-sky-500">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                GMB<span className="text-teal-500">CLEANER</span>
              </span>
            </div>
          </div>

          {/* Desktop page indicator */}
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-500">
              {navItems.find((n) => isActive(n.href))?.label || 'Dashboard'}
            </p>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      Mark all read
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-72">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                          !notif.is_read ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notif.is_read ? 'bg-slate-300' : 'bg-teal-500'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100">
                  <Avatar className="h-8 w-8">
                    {extendedProfile?.avatar_url ? (
                      <AvatarImage src={extendedProfile.avatar_url} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-sky-500 text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold text-slate-900">{displayName}</p>
                    <p className="text-[10px] text-slate-500">
                      ${walletBalance.toFixed(2)}
                    </p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{displayName}</span>
                    <span className="text-xs text-slate-500">{profile?.email || user?.email}</span>
                    {profile?.user_code && (
                      <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                        {profile.user_code}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing" className="flex items-center gap-2 cursor-pointer">
                    <Receipt className="h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/add-funds" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-4 w-4" />
                    Add Funds
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
