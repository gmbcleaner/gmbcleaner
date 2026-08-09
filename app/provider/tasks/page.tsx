'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCollection, updateDocument, getDocument, addDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClipboardList, ExternalLink, ChevronDown, ChevronRight, Play, CheckCircle2, Clock, ListOrdered } from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  review_url: string;
  status: string;
}

interface TaskOrder {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  item_count: number;
  created_at: string;
  items: OrderItem[];
  completedCount: number;
}

export default function ProviderTasksPage() {
  const [orders, setOrders] = useState<TaskOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const allTasks = await fetchCollection('provider_tasks', undefined, 'created_at');

      const orderMap = new Map<string, TaskOrder>();

      for (const task of allTasks) {
        if (!orderMap.has(task.order_id)) {
          let order = null;
          try {
            order = await getDocument('orders', task.order_id);
          } catch {}
          if (order) {
            orderMap.set(task.order_id, {
              id: order.id,
              order_code: order.order_code,
              status: order.status,
              total_amount: order.total_amount,
              item_count: order.item_count,
              created_at: order.created_at,
              items: [],
              completedCount: 0,
            });
          }
        }

        const orderEntry = orderMap.get(task.order_id);
        if (orderEntry) {
          orderEntry.items.push({
            id: task.id,
            order_id: task.order_id,
            review_url: task.review_url,
            status: task.status,
          });
          if (task.status === 'completed') {
            orderEntry.completedCount++;
          }
        }
      }

      const result = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(result);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const startItem = async (taskId: string) => {
    setUpdatingItem(taskId);
    try {
      await updateDocument('provider_tasks', taskId, { status: 'processing' });
      toast({ title: 'Task started' });
      fetchTasks();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingItem(null);
    }
  };

  const completeItem = async (taskId: string, orderId: string) => {
    setUpdatingItem(taskId);
    try {
      await updateDocument('provider_tasks', taskId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      const remaining = await fetchCollection(
        'provider_tasks',
        [
          { field: 'order_id', op: '==', value: orderId },
          { field: 'status', op: '!=', value: 'completed' },
        ]
      );

      if (!remaining || remaining.length === 0) {
        await updateDocument('orders', orderId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      }

      toast({ title: 'Review completed' });
      fetchTasks();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingItem(null);
    }
  };

  const startAllItems = async (orderId: string) => {
    setUpdatingOrder(orderId);
    try {
      const tasks = orders.find(o => o.id === orderId)?.items || [];
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      await Promise.all(
        pendingTasks.map(t => updateDocument('provider_tasks', t.id, { status: 'processing' }))
      );
      await updateDocument('orders', orderId, { status: 'processing' });
      toast({ title: 'All tasks started' });
      fetchTasks();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const processingOrders = orders.filter(o => o.status === 'processing');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  const itemStatusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  const renderOrderCard = (order: TaskOrder) => {
    const isExpanded = expandedOrder === order.id;
    const progress = order.item_count > 0 ? Math.round((order.completedCount / order.item_count) * 100) : 0;

    return (
      <Card key={order.id} className="shadow-card overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <ListOrdered className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{order.order_code}</p>
                <Badge className={statusColors[order.status] || 'bg-slate-100 text-slate-600'}>{order.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {order.item_count} reviews &middot; ${order.total_amount.toFixed(2)} &middot; {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">{order.completedCount}/{order.item_count} done</p>
              <Progress value={progress} className="h-1.5 w-24 mt-1" />
            </div>
            {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Progress: {progress}%</p>
              {order.status !== 'completed' && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  onClick={(e) => { e.stopPropagation(); startAllItems(order.id); }}
                  disabled={updatingOrder === order.id || order.items.every(t => t.status !== 'pending')}
                >
                  <Play className="mr-1 h-3 w-3" />
                  {updatingOrder === order.id ? 'Starting...' : 'Start All'}
                </Button>
              )}
            </div>
            <Progress value={progress} className="h-2" />

            {order.items.map((item) => (
              <div key={item.id} className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${item.status === 'completed' ? 'border-green-200 bg-green-50' : item.status === 'processing' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={itemStatusColors[item.status] || 'bg-slate-100 text-slate-600'}>{item.status}</Badge>
                  </div>
                  <a
                    href={item.review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.review_url}</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {item.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={(e) => { e.stopPropagation(); startItem(item.id); }}
                      disabled={updatingItem === item.id}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Start
                    </Button>
                  )}
                  {item.status === 'processing' && (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      onClick={(e) => { e.stopPropagation(); completeItem(item.id, order.id); }}
                      disabled={updatingItem === item.id}
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {updatingItem === item.id ? 'Saving...' : 'Mark Done'}
                    </Button>
                  )}
                  {item.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
        <p className="text-sm text-slate-500">Manage your assigned review dispute tasks.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <ClipboardList className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900">No tasks yet</p>
            <p className="mt-1 text-xs text-slate-500">Orders will appear here once assigned.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingOrders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending ({pendingOrders.length})
              </h2>
              {pendingOrders.map(renderOrderCard)}
            </div>
          )}

          {processingOrders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-500" />
                In Progress ({processingOrders.length})
              </h2>
              {processingOrders.map(renderOrderCard)}
            </div>
          )}

          {completedOrders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Completed ({completedOrders.length})
              </h2>
              {completedOrders.map(renderOrderCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
