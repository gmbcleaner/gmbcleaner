'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListOrdered,
  Settings,
  LogOut,
  Wrench,
  Menu,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/provider', icon: LayoutDashboard },
  { label: 'Tasks', href: '/provider/tasks', icon: ClipboardList },
  { label: 'Orders', href: '/provider/orders', icon: ListOrdered },
  { label: 'Settings', href: '/provider/settings', icon: Settings },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const isProvider = localStorage.getItem('gmb_provider_auth');
      const providerEmail = localStorage.getItem('gmb_provider_email');
      if (!isProvider || providerEmail !== 'eyasinmahmudmd993@gmail.com') {
        localStorage.removeItem('gmb_provider_auth');
        localStorage.removeItem('gmb_provider_email');
        router.replace('/atik');
        return;
      }
    } catch {}
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('gmb_provider_auth');
      localStorage.removeItem('gmb_provider_email');
      const { getAuth, signOut } = await import('firebase/auth');
      signOut(getAuth());
    } catch {}
    router.replace('/atik');
  };

  const isActive = (href: string) => {
    if (href === '/provider') return pathname === '/provider';
    return pathname.startsWith(href);
  };

  if (!authChecked) return null;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            GMB<span className="text-blue-500">PROVIDER</span>
          </span>
          <Badge variant="secondary" className="ml-2 text-[10px]">Provider</Badge>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
          <p className="text-xs font-medium text-slate-400">Logged in as</p>
          <p className="mt-1 text-sm font-bold text-white">Provider</p>
          <p className="text-[10px] text-blue-400 mt-0.5">Service Provider</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-bold text-slate-900">GMB<span className="text-blue-500">PROVIDER</span></span>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-500">
              {navItems.find((n) => isActive(n.href))?.label || 'Provider'}
            </p>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold text-slate-900">Provider</p>
                    <p className="text-[10px] text-blue-500">Service Provider</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Provider Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
