'use client';

import { useEffect, useState } from 'react';
import { Users, ListOrdered, DollarSign, Activity } from 'lucide-react';
import { fetchCollection, countDocuments } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [totalUsers, totalOrders, completedOrders, pendingOrders, recentOrdersData] = await Promise.all([
          countDocuments('profiles'),
          countDocuments('orders'),
          fetchCollection('orders', [{ field: 'status', op: '==', value: 'completed' }]),
          countDocuments('orders', [{ field: 'status', op: '==', value: 'pending' }]),
          fetchCollection('orders', undefined, 'created_at', 10),
        ]);

        if (cancelled) return;

        const totalRevenue = (completedOrders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

        setStats({
          totalUsers: totalUsers || 0,
          totalOrders: totalOrders || 0,
          totalRevenue,
          pendingOrders: pendingOrders || 0,
        });

        setRecentOrders((recentOrdersData as RecentOrder[]) || []);
      } catch {
        // Firebase unavailable or collections missing
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    { title: 'Total Users', value: String(stats.totalUsers), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Orders', value: String(stats.totalOrders), icon: ListOrdered, color: 'text-teal-500', bg: 'bg-teal-50' },
    { title: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Pending Orders', value: String(stats.pendingOrders), icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    {loading ? (
                      <Skeleton className="mt-2 h-8 w-20" />
                    ) : (
                      <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                    )}
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.order_code || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">${(order.total_amount || 0).toFixed(2)}</span>
                    <Badge className={statusColors[order.status] || 'bg-slate-100 text-slate-700'}>
                      {order.status || 'unknown'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
