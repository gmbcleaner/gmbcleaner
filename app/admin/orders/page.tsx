'use client';

import { useEffect, useState } from 'react';
import { fetchCollection, updateDocument, addDocument, getDocument, deleteDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListOrdered, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  item_count: number;
  notes: string | null;
  assigned_provider: string | null;
  created_at: string;
  user_email?: string;
  order_items?: { id: string; review_url: string; status: string }[];
}

interface Provider {
  id: string;
  email: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const ordersData = await fetchCollection('orders', undefined, 'created_at');
      const enrichedOrders = await Promise.all(
        (ordersData || []).map(async (order: any) => {
          let user_email = '';
          if (order.user_id) {
            const profile = await getDocument('profiles', order.user_id);
            user_email = profile?.email || '';
          }
          const orderItems = await fetchCollection('order_items', [{ field: 'order_id', op: '==', value: order.id }]);
          return { ...order, user_email, order_items: orderItems || [] } as Order;
        })
      );
      setOrders(enrichedOrders);
      const provs = await fetchCollection('profiles', [{ field: 'role', op: '==', value: 'provider' }]);
      setProviders((provs as Provider[]) || []);
    } catch {}
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await updateDocument('orders', orderId, { status });
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await addDocument('notifications', {
          user_id: order.user_id,
          title: 'Order Updated',
          message: `Your order ${order.order_code} status changed to ${status}.`,
          type: 'order',
          is_read: false,
        });
      }
      toast({ title: 'Order updated' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const assignProvider = async (orderId: string, providerId: string) => {
    try {
      await updateDocument('orders', orderId, { assigned_provider: providerId });
      const order = orders.find(o => o.id === orderId);
      if (order?.order_items) {
        for (const item of order.order_items) {
          await addDocument('provider_tasks', {
            order_id: orderId,
            order_item_id: item.id,
            provider_id: providerId,
            status: 'pending',
            review_url: item.review_url,
          });
        }
      }
      toast({ title: 'Provider assigned' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDocument('orders', orderId);
      const order = orders.find(o => o.id === orderId);
      if (order?.order_items) {
        for (const item of order.order_items) {
          await deleteDocument('order_items', item.id);
        }
      }
      const tasks = await fetchCollection('provider_tasks', [{ field: 'order_id', op: '==', value: orderId }]);
      for (const task of tasks) {
        await deleteDocument('provider_tasks', task.id);
      }
      toast({ title: 'Order moved to trash' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    on_hold: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Management</h1>
        <p className="text-sm text-slate-500">Manage orders, assign providers, update statuses.</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <ListOrdered className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{order.order_code}</p>
                        <p className="text-xs text-slate-500">{order.user_email || 'Unknown'} &middot; {order.item_count} items &middot; {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">${(order.total_amount || 0).toFixed(2)}</span>
                      <Badge className={statusColors[order.status] || 'bg-slate-100 text-slate-700'}>{order.status}</Badge>
                      {expanded === order.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                  {expanded === order.id && (
                    <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50/50">
                      <div className="flex flex-wrap gap-2">
                        <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={order.assigned_provider || ''} onValueChange={(v) => assignProvider(order.id, v)}>
                          <SelectTrigger className="w-48"><SelectValue placeholder="Assign Provider" /></SelectTrigger>
                          <SelectContent>
                            {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.email}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => deleteOrder(order.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-500">Order Items:</p>
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-lg bg-white border border-slate-200 p-2">
                              <span className="text-xs font-mono text-slate-600 truncate max-w-md">{item.review_url}</span>
                              <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      {order.notes && <p className="text-xs text-slate-500"><strong>Notes:</strong> {order.notes}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
