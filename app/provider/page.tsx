'use client';

import { useEffect, useState } from 'react';
import { ListOrdered, CheckCircle2, Clock, Package } from 'lucide-react';
import { fetchCollection } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  item_count: number;
  created_at: string;
}

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchCollection('orders', undefined, 'created_at')
      .then((data) => setOrders((data as Order[]) || []))
      .catch(() => {});
  }, [user]);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const statCards = [
    { title: 'Total Orders', value: String(orders.length), icon: ListOrdered, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Pending', value: String(pendingOrders.length), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Completed', value: String(completedOrders.length), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: Package, color: 'text-teal-500', bg: 'bg-teal-50' },
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Provider Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of orders and tasks.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.order_code}</p>
                    <p className="text-xs text-slate-500">{order.item_count} items &middot; {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">${(order.total_amount || 0).toFixed(2)}</span>
                    <Badge className={statusColors[order.status] || 'bg-slate-100 text-slate-700'}>{order.status}</Badge>
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
