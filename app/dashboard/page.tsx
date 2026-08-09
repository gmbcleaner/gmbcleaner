'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ShoppingBag,
  CheckCircle2,
  PlusCircle,
  ArrowUpRight,
  Bell,
  Package,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { fetchCollection, countDocuments } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderRow { id: string; order_code: string; status: string; total_amount: number; item_count: number; created_at: string; }
interface NotificationRow { id: string; title: string; message: string; type: string; is_read: boolean; created_at: string; }
interface DashboardStats { walletBalance: number; totalOrders: number; activeOrders: number; completedItems: number; }

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-sky-100 text-sky-700 border-sky-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <Badge variant="outline" className={`capitalize ${colorClass}`}>{status || 'pending'}</Badge>;
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Wallet; label: string; value: string; accent: 'teal' | 'sky' | 'amber' | 'emerald'; }) {
  const accentMap = {
    teal: { bg: 'from-teal-500 to-teal-600', text: 'text-teal-600', glow: 'shadow-teal-500/20' },
    sky: { bg: 'from-sky-500 to-sky-600', text: 'text-sky-600', glow: 'shadow-sky-500/20' },
    amber: { bg: 'from-amber-500 to-amber-600', text: 'text-amber-600', glow: 'shadow-amber-500/20' },
    emerald: { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', glow: 'shadow-emerald-500/20' },
  };
  const a = accentMap[accent];
  return (
    <Card className={`relative overflow-hidden shadow-card ${a.glow}`}>
      <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br opacity-5" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium text-slate-500">{label}</CardDescription>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${a.bg} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent><div className={`text-3xl font-bold ${a.text}`}>{value}</div></CardContent>
    </Card>
  );
}

export default function DashboardHomePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ walletBalance: 0, totalOrders: 0, activeOrders: 0, completedItems: 0 });
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationRow[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const filters = [{ field: 'user_id', op: '==' as const, value: user.uid }];
      const [ordersData, completedItemsData, notifData, totalOrders, activeOrders] = await Promise.all([
        fetchCollection('orders', filters, 'created_at', 5),
        fetchCollection('order_items', [...filters, { field: 'status', op: '==' as const, value: 'completed' }]),
        fetchCollection('notifications', filters, 'created_at', 5),
        countDocuments('orders', filters),
        countDocuments('orders', [...filters, { field: 'status', op: 'in' as const, value: ['pending', 'processing'] }]),
      ]);
      setRecentOrders(ordersData as OrderRow[]);
      setRecentNotifications(notifData as NotificationRow[]);
      setStats({
        walletBalance: profile?.wallet_balance ?? 0,
        totalOrders: totalOrders,
        activeOrders: activeOrders,
        completedItems: completedItemsData.length,
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to load dashboard data.', variant: 'destructive' });
    }
  }, [user, profile]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (user) refreshProfile(); }, [user, refreshProfile]);

  const completionRate = stats.totalOrders > 0 ? Math.round((stats.completedItems / (stats.totalOrders * 5 || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back{profile?.email ? `, ${profile.email.split('@')[0]}` : ''}!</h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your account today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600">
            <Link href="/dashboard/new-order"><PlusCircle className="mr-2 h-4 w-4" />New Order</Link>
          </Button>
          <Button asChild variant="outline"><Link href="/dashboard/add-funds"><Wallet className="mr-2 h-4 w-4" />Add Funds</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Wallet Balance" value={`$${stats.walletBalance.toFixed(2)}`} accent="teal" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(stats.totalOrders)} accent="sky" />
        <StatCard icon={Clock} label="Active Orders" value={String(stats.activeOrders)} accent="amber" />
        <StatCard icon={CheckCircle2} label="Completed Items" value={String(stats.completedItems)} accent="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-lg">Recent Orders</CardTitle><CardDescription>Your latest review dispute orders</CardDescription></div>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/orders">View all<ArrowUpRight className="ml-1 h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100"><Package className="h-7 w-7 text-slate-400" /></div>
                <p className="mt-4 text-sm font-medium text-slate-900">No orders yet</p>
                <p className="mt-1 text-xs text-slate-500">Create your first order to get started.</p>
                <Button asChild className="mt-4"><Link href="/dashboard/new-order"><PlusCircle className="mr-2 h-4 w-4" />New Order</Link></Button>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Order Code</TableHead><TableHead>Date</TableHead><TableHead className="text-center">Items</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-medium text-slate-700">{order.order_code}</TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell className="text-center text-sm text-slate-600">{order.item_count}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-slate-900">${(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100"><Bell className="h-4 w-4 text-sky-600" /></div>
              <div><CardTitle className="text-lg">Notifications</CardTitle><CardDescription>Latest updates</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100"><Bell className="h-7 w-7 text-slate-400" /></div>
                <p className="mt-4 text-sm font-medium text-slate-900">All caught up!</p>
                <p className="mt-1 text-xs text-slate-500">No new notifications.</p>
              </div>
            ) : (
              <ScrollArea className="h-72">
                <div className="space-y-4">
                  {recentNotifications.map((notif) => (
                    <div key={notif.id} className={`flex gap-3 rounded-lg border p-3 transition-colors ${notif.is_read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50/40'}`}>
                      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notif.is_read ? 'bg-slate-300' : 'bg-teal-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.totalOrders > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-lg">Completion Progress</CardTitle><CardDescription>Overall progress across all your orders</CardDescription></div>
              <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-1.5">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-semibold text-teal-700">{completionRate}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-3" />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{stats.completedItems} completed items</span>
              <span>{stats.totalOrders} total orders</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
