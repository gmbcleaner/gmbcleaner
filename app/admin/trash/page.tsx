'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCollection, hardDeleteDocument, updateDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RotateCcw, AlertTriangle, ListOrdered, Users, Banknote, Package } from 'lucide-react';

interface DeletedItem {
  id: string;
  _collection: string;
  _deletedAt: string;
  [key: string]: any;
}

const collectionLabels: Record<string, string> = {
  orders: 'Order',
  order_items: 'Order Item',
  profiles: 'User',
  deposits: 'Deposit',
  provider_tasks: 'Provider Task',
  notifications: 'Notification',
  transactions: 'Transaction',
  support_tickets: 'Support Ticket',
  currencies: 'Currency',
  networks: 'Network',
  wallet_addresses: 'Wallet Address',
};

const collectionIcons: Record<string, typeof ListOrdered> = {
  orders: ListOrdered,
  order_items: Package,
  profiles: Users,
  deposits: Banknote,
  provider_tasks: Package,
};

const collections = ['orders', 'order_items', 'profiles', 'deposits', 'provider_tasks', 'notifications', 'transactions', 'support_tickets', 'currencies', 'networks', 'wallet_addresses'];

export default function AdminTrashPage() {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const allDeleted: DeletedItem[] = [];
      await Promise.all(
        collections.map(async (col) => {
          try {
            const items = await fetchCollection(col, undefined, undefined, undefined, true);
            const deleted = items.filter((item: any) => item.is_deleted === true);
            deleted.forEach((item: any) => {
              allDeleted.push({ ...item, _collection: col, _deletedAt: item.deleted_at || '' });
            });
          } catch {}
        })
      );
      allDeleted.sort((a, b) => new Date(b._deletedAt).getTime() - new Date(a._deletedAt).getTime());
      setDeletedItems(allDeleted);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeleted(); }, [fetchDeleted]);

  const restoreItem = async (col: string, id: string) => {
    try {
      await updateDocument(col, id, { is_deleted: false, deleted_at: null });
      toast({ title: 'Restored', description: 'Item has been restored.' });
      fetchDeleted();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const permanentDelete = async (col: string, id: string) => {
    try {
      await hardDeleteDocument(col, id);
      toast({ title: 'Deleted', description: 'Item has been permanently deleted.' });
      fetchDeleted();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const filteredItems = filter === 'all' ? deletedItems : deletedItems.filter(i => i._collection === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trash</h1>
        <p className="text-sm text-slate-500">Manage deleted items. Restore or permanently delete them.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-slate-900 text-white' : ''}
        >
          All ({deletedItems.length})
        </Button>
        {collections.map((col) => {
          const count = deletedItems.filter(i => i._collection === col).length;
          if (count === 0) return null;
          return (
            <Button
              key={col}
              size="sm"
              variant={filter === col ? 'default' : 'outline'}
              onClick={() => setFilter(col)}
              className={filter === col ? 'bg-slate-900 text-white' : ''}
            >
              {collectionLabels[col] || col} ({count})
            </Button>
          );
        })}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading deleted items...</p>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Trash2 className="h-7 w-7 text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-900">Trash is empty</p>
              <p className="mt-1 text-xs text-slate-500">Deleted items will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = collectionIcons[item._collection] || Package;
                return (
                  <div key={`${item._collection}-${item.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.order_code || item.email || item.name || item.review_url || item.title || item.id}
                          </p>
                          <Badge variant="outline" className="text-[10px] shrink-0">{collectionLabels[item._collection] || item._collection}</Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          Deleted {item._deletedAt ? new Date(item._deletedAt).toLocaleString() : 'recently'}
                          {item.user_email && ` · ${item.user_email}`}
                          {item.amount && ` · $${item.amount}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => restoreItem(item._collection, item.id)}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => permanentDelete(item._collection, item.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
