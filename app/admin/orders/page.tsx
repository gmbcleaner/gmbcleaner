'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCollection, updateDocument, addDocument, getDocument, deleteDocument } from '@/lib/db';
import { sendTelegramAdminOnly, setTelegramChatIds } from '@/lib/telegram';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ListOrdered, ChevronDown, ChevronUp, Trash2, ExternalLink, Search, Filter, Edit,
  Package, CheckCircle2, XCircle, Star, MapPin, PlayCircle, Shield, RotateCcw,
  Save, DollarSign,
} from 'lucide-react';

interface OrderItem {
  id: string;
  review_url: string;
  review_text?: string;
  star_rating?: number;
  country?: string;
  status: string;
}

interface Order {
  id: string;
  order_code: string;
  status: string;
  service_type?: string;
  total_amount: number;
  item_count: number;
  notes: string | null;
  assigned_provider: string | null;
  created_at: string;
  user_id?: string;
  user_email?: string;
  order_items?: OrderItem[];
}

interface Provider {
  id: string;
  email: string;
}

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'rejected', 'on_hold'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  on_hold: 'bg-slate-100 text-slate-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected',
  on_hold: 'On Hold',
};

const SERVICE_TYPES = [
  { id: 'all', label: 'All Services', icon: Package },
  { id: 'removal', label: 'Review Removal', icon: XCircle },
  { id: 'play_store', label: 'Play Store', icon: PlayCircle },
  { id: 'maps', label: 'Google Maps', icon: MapPin },
  { id: 'trustpilot', label: 'Trustpilot', icon: Shield },
];

const SERVICE_BADGE_COLORS: Record<string, string> = {
  removal: 'bg-red-100 text-red-700 border-red-200',
  play_store: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  maps: 'bg-blue-100 text-blue-700 border-blue-200',
  trustpilot: 'bg-teal-100 text-teal-700 border-teal-200',
};

const SERVICE_NAMES: Record<string, string> = {
  removal: 'Review Removal',
  play_store: 'Google Play Store',
  maps: 'Google Maps',
  trustpilot: 'Trustpilot',
};

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTab, setServiceTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const [serviceRevenueId, setServiceRevenueId] = useState<string | null>(null);
  const [serviceRevenue, setServiceRevenue] = useState<Record<string, number>>({
    removal: 0,
    play_store: 0,
    maps: 0,
    trustpilot: 0,
  });
  const [editingRevenueService, setEditingRevenueService] = useState<string | null>(null);
  const [editingRevenueAmount, setEditingRevenueAmount] = useState('');

  const [refundDialogItem, setRefundDialogItem] = useState<{ orderId: string; orderCode: string; itemId: string; itemUrl: string; userId: string; userEmail: string } | null>(null);

  const loadTelegramSettings = useCallback(async () => {
    try {
      const data = await fetchCollection('admin_settings');
      if (data && data.length > 0) {
        const s = data[0];
        setTelegramChatIds(s.admin_telegram_id || '', s.provider_telegram_id || '');
      }
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const ordersData = await fetchCollection('orders', undefined, 'created_at');
      const enriched = await Promise.all(
        (ordersData || []).map(async (order: any) => {
          let user_email = '';
          if (order.user_id) {
            const profile = await getDocument('profiles', order.user_id);
            user_email = profile?.email || '';
          }
          const orderItems = await fetchCollection('order_items', [
            { field: 'order_id', op: '==', value: order.id },
          ]);
          return { ...order, user_email, order_items: orderItems || [] } as Order;
        })
      );
      setOrders(enriched);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      const data = await fetchCollection('profiles', [{ field: 'role', op: '==', value: 'provider' }]);
      setProviders((data as Provider[]) || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadTelegramSettings();
    fetchOrders();
    fetchProviders();

    fetchCollection('service_revenue')
      .then((data) => {
        if (data && data.length > 0) {
          const row = data[0];
          setServiceRevenueId(row.id);
          setServiceRevenue({
            removal: row.removal ?? 0,
            play_store: row.play_store ?? 0,
            maps: row.maps ?? 0,
            trustpilot: row.trustpilot ?? 0,
          });
        }
      })
      .catch(() => {});
  }, [loadTelegramSettings, fetchOrders, fetchProviders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateDocument('orders', orderId, { status: newStatus });
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        await addDocument('notifications', {
          user_id: order.user_id,
          title: 'Order Updated',
          message: `Your order ${order.order_code} status changed to ${STATUS_LABELS[newStatus] || newStatus}.`,
          type: 'order',
          is_read: false,
        });
        const msg = `📦 <b>Order Status Updated</b>\n\n` +
          `<b>Order:</b> ${order.order_code}\n` +
          `<b>Status:</b> ${STATUS_LABELS[newStatus] || newStatus}\n` +
          `<b>User:</b> ${order.user_email || 'Unknown'}\n` +
          `<b>Amount:</b> $${(order.total_amount || 0).toFixed(2)}`;
        sendTelegramAdminOnly(msg);
      }
      toast({ title: 'Status updated' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const assignProvider = async (orderId: string, providerId: string) => {
    setUpdatingId(orderId);
    try {
      await updateDocument('orders', orderId, { assigned_provider: providerId });
      const order = orders.find((o) => o.id === orderId);
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
      const provider = providers.find((p) => p.id === providerId);
      if (order && provider) {
        const msg = `👤 <b>Provider Assigned</b>\n\n` +
          `<b>Order:</b> ${order.order_code}\n` +
          `<b>Provider:</b> ${provider.email}\n` +
          `<b>Items:</b> ${order.order_items?.length || 0}`;
        sendTelegramAdminOnly(msg);
      }
      toast({ title: 'Provider assigned' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      await deleteDocument('orders', orderId);
      if (order?.order_items) {
        for (const item of order.order_items) {
          await deleteDocument('order_items', item.id);
        }
      }
      const tasks = await fetchCollection('provider_tasks', [
        { field: 'order_id', op: '==', value: orderId },
      ]);
      for (const task of tasks) {
        await deleteDocument('provider_tasks', task.id);
      }
      if (order) {
        const msg = `🗑️ <b>Order Deleted</b>\n\n` +
          `<b>Order:</b> ${order.order_code}\n` +
          `<b>User:</b> ${order.user_email || 'Unknown'}\n` +
          `<b>Amount:</b> $${(order.total_amount || 0).toFixed(2)}`;
        sendTelegramAdminOnly(msg);
      }
      toast({ title: 'Order moved to trash' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (order: Order) => {
    setEditOrder(order);
    setEditNotes(order.notes || '');
    setEditAmount(String(order.total_amount || 0));
  };

  const saveOrderEdits = async () => {
    if (!editOrder) return;
    setSaving(true);
    try {
      await updateDocument('orders', editOrder.id, {
        notes: editNotes.trim(),
        total_amount: parseFloat(editAmount) || 0,
      });
      toast({ title: 'Order updated' });
      setEditOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleItemStatus = async (orderId: string, itemId: string, newStatus: 'completed' | 'rejected') => {
    try {
      await updateDocument('order_items', itemId, { status: newStatus });

      if (newStatus === 'rejected') {
        const order = orders.find((o) => o.id === orderId);
        if (order?.user_id) {
          const profile = await getDocument('profiles', order.user_id);
          if (profile) {
            const pricePerItem = order.total_amount / (order.item_count || 1);
            const refundAmount = pricePerItem;
            const newBalance = (profile.wallet_balance || 0) + refundAmount;
            await updateDocument('profiles', order.user_id, { wallet_balance: newBalance });

            await addDocument('transactions', {
              user_id: order.user_id,
              type: 'refund',
              amount: refundAmount,
              balance_after: newBalance,
              description: `Refund for rejected review in order ${order.order_code}`,
            });

            await addDocument('notifications', {
              user_id: order.user_id,
              title: 'Review Rejected — Refund Issued',
              message: `A review in your order ${order.order_code} was rejected. $${refundAmount.toFixed(2)} has been refunded to your wallet.`,
              type: 'refund',
              is_read: false,
            });
          }
        }
      }

      const allItems = orders.find((o) => o.id === orderId)?.order_items || [];
      const updatedItems = allItems.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      );
      const allCompleted = updatedItems.every((item) => item.status === 'completed');
      const anyRejected = updatedItems.some((item) => item.status === 'rejected');

      if (allCompleted) {
        await updateDocument('orders', orderId, { status: 'completed' });
      } else if (anyRejected) {
        await updateDocument('orders', orderId, { status: 'processing' });
      }

      toast({ title: newStatus === 'completed' ? 'Review accepted' : 'Review rejected & refunded' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = orders.filter((order) => {
    const matchSearch =
      !search ||
      order.order_code?.toLowerCase().includes(search.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      order.notes?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchService = serviceTab === 'all' || order.service_type === serviceTab;
    return matchSearch && matchStatus && matchService;
  });

  const getServiceCounts = () => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      const st = o.service_type || 'removal';
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  };

  const serviceCounts = getServiceCounts();

  const getApprovedByService = () => {
    const result: Record<string, { count: number; amount: number }> = {
      removal: { count: 0, amount: 0 },
      play_store: { count: 0, amount: 0 },
      maps: { count: 0, amount: 0 },
      trustpilot: { count: 0, amount: 0 },
    };
    orders.forEach((o) => {
      if (o.status === 'completed') {
        const st = o.service_type || 'removal';
        if (result[st]) {
          result[st].count += 1;
          result[st].amount += o.total_amount || 0;
        }
      }
    });
    return result;
  };

  const approvedByService = getApprovedByService();

  const startEditRevenue = (serviceId: string) => {
    setEditingRevenueService(serviceId);
    setEditingRevenueAmount(String(serviceRevenue[serviceId] || 0));
  };

  const saveRevenue = async () => {
    if (!editingRevenueService) return;
    try {
      const updated = { ...serviceRevenue, [editingRevenueService]: parseFloat(editingRevenueAmount) || 0 };
      setServiceRevenue(updated);
      if (serviceRevenueId) {
        await updateDocument('service_revenue', serviceRevenueId, updated);
      } else {
        const newId = await addDocument('service_revenue', updated);
        setServiceRevenueId(newId);
      }
      toast({ title: 'Revenue updated' });
      setEditingRevenueService(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const SERVICE_CARD_CONFIG = [
    { id: 'removal', name: 'Review Removal', icon: XCircle, color: 'from-red-500 to-rose-500', bg: 'bg-red-50', text: 'text-red-600' },
    { id: 'play_store', name: 'Google Play Store', icon: PlayCircle, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { id: 'maps', name: 'Google Maps', icon: MapPin, color: 'from-blue-500 to-sky-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { id: 'trustpilot', name: 'Trustpilot', icon: Shield, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50', text: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Management</h1>
          <p className="text-sm text-slate-500">Manage orders, review items, assign providers, update statuses.</p>
        </div>
        <Badge variant="outline" className="w-fit">{orders.length} orders</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICE_CARD_CONFIG.map((svc) => {
          const Icon = svc.icon;
          const approved = approvedByService[svc.id] || { count: 0, amount: 0 };
          const manualAmount = serviceRevenue[svc.id] || 0;
          const totalAmount = approved.amount + manualAmount;
          const isEditing = editingRevenueService === svc.id;
          return (
            <Card key={svc.id} className="shadow-card overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${svc.color}`} />
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${svc.bg}`}>
                    <Icon className={`h-4 w-4 ${svc.text}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">{svc.name}</p>
                    <p className="text-lg font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approved orders</span>
                    <span className="font-semibold text-slate-700">{approved.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">From orders</span>
                    <span className="font-semibold text-slate-700">${approved.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Manual adjust</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={editingRevenueAmount}
                            onChange={(e) => setEditingRevenueAmount(e.target.value)}
                            className="h-6 w-20 pl-5 text-[11px] py-0"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') saveRevenue(); if (e.key === 'Escape') setEditingRevenueService(null); }}
                          />
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-emerald-600" onClick={saveRevenue}>
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditRevenue(svc.id)}
                        className="font-semibold text-slate-700 hover:text-teal-600 transition-colors cursor-pointer"
                      >
                        ${manualAmount.toFixed(2)}
                        <Edit className="inline ml-1 h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={serviceTab} onValueChange={setServiceTab}>
        <TabsList className="flex w-full overflow-x-auto">
          {SERVICE_TYPES.map((st) => {
            const Icon = st.icon;
            return (
              <TabsTrigger key={st.id} value={st.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <Icon className="h-3.5 w-3.5" />
                {st.label}
                <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0">
                  {serviceCounts[st.id] || 0}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by order code, user email, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading orders...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No orders found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div key={order.id} className="rounded-lg border border-slate-200 overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                        <ListOrdered className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900">{order.order_code}</p>
                          {order.service_type && (
                            <Badge className={`${SERVICE_BADGE_COLORS[order.service_type] || 'bg-slate-100 text-slate-700'} text-[10px]`}>
                              {SERVICE_NAMES[order.service_type] || order.service_type}
                            </Badge>
                          )}
                          {updatingId === order.id && (
                            <span className="text-[10px] text-blue-500 animate-pulse">Updating...</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {order.user_email || 'Unknown'} &middot; {order.item_count || order.order_items?.length || 0} items &middot; {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-sm font-bold text-slate-900">${(order.total_amount || 0).toFixed(2)}</span>
                      <Badge className={`${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700'} text-[10px]`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                      {expanded === order.id ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {expanded === order.id && (
                    <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50/50">
                      <div className="flex flex-wrap gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-slate-400">Status</Label>
                          <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-slate-400">Assign Provider</Label>
                          <Select value={order.assigned_provider || ''} onValueChange={(v) => assignProvider(order.id, v)}>
                            <SelectTrigger className="w-48 h-8 text-xs">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.email}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => openEditDialog(order)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deleteOrder(order.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium uppercase text-slate-400">Details</p>
                          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1">
                            <p className="text-xs text-slate-600"><strong>User:</strong> {order.user_email || 'Unknown'}</p>
                            <p className="text-xs text-slate-600"><strong>Amount:</strong> ${(order.total_amount || 0).toFixed(2)}</p>
                            {order.service_type && (
                              <p className="text-xs text-slate-600"><strong>Service:</strong> {SERVICE_NAMES[order.service_type] || order.service_type}</p>
                            )}
                            <p className="text-xs text-slate-600"><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
                            {order.assigned_provider && (
                              <p className="text-xs text-slate-600">
                                <strong>Provider:</strong> {providers.find((p) => p.id === order.assigned_provider)?.email || order.assigned_provider}
                              </p>
                            )}
                            {order.notes && (
                              <p className="text-xs text-slate-600"><strong>Notes:</strong> {order.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-medium uppercase text-slate-400">
                            Order Items ({order.order_items?.length || 0})
                          </p>
                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="space-y-1.5">
                              {order.order_items.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-lg bg-white border border-slate-200 p-2.5 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <Package className="h-3 w-3 text-slate-400 shrink-0" />
                                      <a
                                        href={item.review_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-mono text-blue-600 hover:underline truncate flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {item.review_url?.length > 40 ? item.review_url.slice(0, 40) + '...' : item.review_url}
                                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                      </a>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                                      {STATUS_LABELS[item.status] || item.status}
                                    </Badge>
                                  </div>

                                  {(item.review_text || item.star_rating) && (
                                    <div className="space-y-1 pt-1 border-t border-slate-100">
                                      {item.star_rating && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-slate-400">Rating:</span>
                                          <StarDisplay value={item.star_rating} />
                                        </div>
                                      )}
                                      {item.review_text && (
                                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                                          &ldquo;{item.review_text}&rdquo;
                                        </p>
                                      )}
                                      {item.country && (
                                        <p className="text-[10px] text-slate-400">Country: {item.country}</p>
                                      )}
                                    </div>
                                  )}

                                  {item.status === 'pending' && (
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-[10px] text-green-700 border-green-200 hover:bg-green-50"
                                        onClick={(e) => { e.stopPropagation(); handleItemStatus(order.id, item.id, 'completed'); }}
                                      >
                                        <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                                        Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-[10px] text-red-700 border-red-200 hover:bg-red-50"
                                        onClick={(e) => { e.stopPropagation(); handleItemStatus(order.id, item.id, 'rejected'); }}
                                      >
                                        <XCircle className="mr-1 h-2.5 w-2.5" />
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">No items.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order — {editOrder?.order_code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Total Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Order notes..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrder(null)}>Cancel</Button>
            <Button onClick={saveOrderEdits} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
