'use client';

import { useEffect, useState, useCallback } from 'react';
import { ListOrdered, ChevronDown, ChevronRight, Package, Search, ExternalLink, Inbox } from 'lucide-react';
import { fetchCollection } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface OrderRow { id: string; order_code: string; status: string; total_amount: number; item_count: number; created_at: string; notes: string | null; completed_at?: string; }
interface OrderItemRow { id: string; review_url: string; status: string; }
type StatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'rejected';

function getUserVisibleStatus(order: { status: string; completed_at?: string }): string {
  if (order.status === 'completed' && order.completed_at) {
    const completedAt = new Date(order.completed_at).getTime();
    const now = Date.now();
    const hoursSince = (now - completedAt) / (1000 * 60 * 60);
    if (hoursSince < 48) return 'processing';
  }
  return order.status;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-sky-100 text-sky-700 border-sky-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ITEM_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-sky-100 text-sky-700 border-sky-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  escalated: 'bg-purple-100 text-purple-700 border-purple-200',
};

const ITEMS_PER_PAGE = 10;

function StatusBadge({ status, completed_at }: { status: string; completed_at?: string }) {
  const visibleStatus = getUserVisibleStatus({ status, completed_at });
  const colorClass = STATUS_COLORS[visibleStatus] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <Badge variant="outline" className={`capitalize ${colorClass}`}>{visibleStatus || 'pending'}</Badge>;
}

function ItemStatusBadge({ status }: { status: string }) {
  const colorClass = ITEM_STATUS_COLORS[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <Badge variant="outline" className={`text-[10px] capitalize ${colorClass}`}>{status || 'pending'}</Badge>;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItemRow[]>>({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchCollection('orders', [{ field: 'user_id', op: '==', value: user.uid }], 'created_at');
      setOrders(data as OrderRow[]);
    } catch {
      toast({ title: 'Error', description: 'Failed to load orders.', variant: 'destructive' });
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const fetchOrderItems = useCallback(async (orderId: string) => {
    setLoadingItems(orderId);
    try {
      const data = await fetchCollection('order_items', [{ field: 'order_id', op: '==', value: orderId }]);
      setOrderItems((prev) => ({ ...prev, [orderId]: data as OrderItemRow[] }));
    } catch {} finally { setLoadingItems(null); }
  }, []);

  const toggleExpand = (orderId: string) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!orderItems[orderId]) fetchOrderItems(orderId);
  };

  const filteredOrders = orders.filter((order) => {
    const visibleStatus = getUserVisibleStatus(order);
    const matchesStatus = statusFilter === 'all' || visibleStatus === statusFilter;
    const matchesSearch = !searchQuery || order.order_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage all your review dispute orders.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-lg">Order History</CardTitle><CardDescription>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</CardDescription></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search by order code…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 sm:w-56" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="sm:w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"><Inbox className="h-8 w-8 text-slate-400" /></div>
              <p className="mt-4 text-sm font-medium text-slate-900">{searchQuery || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}</p>
              <p className="mt-1 text-xs text-slate-500">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Create a new order to get started.'}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>Order Code</TableHead><TableHead>Date</TableHead><TableHead className="text-center">Items</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const isExpanded = expandedId === order.id;
                    const items = orderItems[order.id];
                    const isLoadingThisOrder = loadingItems === order.id;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="w-8" onClick={() => toggleExpand(order.id)}>
                          <div className="flex h-5 w-5 items-center justify-center cursor-pointer">
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-slate-700" onClick={() => toggleExpand(order.id)}>{order.order_code}</TableCell>
                        <TableCell className="text-sm text-slate-500" onClick={() => toggleExpand(order.id)}>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                        <TableCell className="text-center text-sm text-slate-600" onClick={() => toggleExpand(order.id)}>{order.item_count}</TableCell>
                        <TableCell className="text-right text-sm font-semibold text-slate-900" onClick={() => toggleExpand(order.id)}>${(order.total_amount || 0).toFixed(2)}</TableCell>
                        <TableCell onClick={() => toggleExpand(order.id)}><StatusBadge status={order.status} completed_at={order.completed_at} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {expandedId && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  {loadingItems === expandedId ? (
                    <p className="py-4 text-sm text-slate-500">Loading items...</p>
                  ) : orderItems[expandedId]?.length > 0 ? (
                    <div className="space-y-2">
                      <p className="mb-2 text-xs font-medium text-slate-500">Review Items</p>
                      {orderItems[expandedId].map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{idx + 1}</span>
                          <a href={item.review_url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-1 text-sm text-teal-600 hover:text-teal-700 hover:underline">
                            <span className="truncate font-mono text-xs">{item.review_url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                          <ItemStatusBadge status={item.status} />
                        </div>
                      ))}
                    </div>
                  ) : <p className="py-4 text-sm text-slate-500">No items found.</p>}
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
