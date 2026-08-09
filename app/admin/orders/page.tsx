'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ListOrdered } from 'lucide-react';

interface Order {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  item_count: number;
  notes: string | null;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, order_code, status, total_amount, item_count, notes, created_at')
          .order('created_at', { ascending: false });
        setOrders((data as Order[]) || []);
      } catch {
        // Supabase unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Orders</h1>
        <p className="text-sm text-slate-500">{orders.length} total orders</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <ListOrdered className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.order_code}</p>
                      <p className="text-xs text-slate-500">
                        {order.item_count} items &middot; {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {order.notes && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-1">{order.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">${order.total_amount.toFixed(2)}</span>
                    <Badge className={statusColors[order.status] || 'bg-slate-100 text-slate-700'}>
                      {order.status}
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
