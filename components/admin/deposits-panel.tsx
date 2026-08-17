'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCollection, updateDocument, addDocument, getDocument, hardDeleteDocument } from '@/lib/db';
import { sendTelegramAdminOnly, setTelegramChatIds } from '@/lib/telegram';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
  Wallet,
  Copy,
  RefreshCw,
} from 'lucide-react';

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  currency?: string;
  network: string;
  tx_hash: string;
  sender_wallet: string | null;
  screenshot_url?: string;
  status: string;
  created_at: string;
  user_email?: string;
  payment_method?: string;
  binance_id?: string;
}

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function DepositsPanel({ deleteMode = false }: { deleteMode?: boolean }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectDialog, setRejectDialog] = useState<Deposit | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deletingDeposit, setDeletingDeposit] = useState<Deposit | null>(null);

  const loadTelegramSettings = useCallback(async () => {
    try {
      const data = await fetchCollection('admin_settings');
      if (data && data.length > 0) {
        const s = data[0];
        setTelegramChatIds(s.admin_telegram_id || '', s.provider_telegram_id || '');
      }
    } catch {}
  }, []);

  const fetchDeposits = useCallback(async () => {
    try {
      const depositsData = await fetchCollection('deposits', undefined, 'created_at');
      const enriched = await Promise.all(
        (depositsData || []).map(async (dep: any) => {
          let user_email = '';
          if (dep.user_id) {
            const profile = await getDocument('profiles', dep.user_id);
            user_email = profile?.email || '';
          }
          return { ...dep, user_email } as Deposit;
        })
      );
      setDeposits(enriched);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTelegramSettings();
    fetchDeposits();
  }, [loadTelegramSettings, fetchDeposits]);

  useEffect(() => {
    const interval = setInterval(fetchDeposits, 10000);
    return () => clearInterval(interval);
  }, [fetchDeposits]);

  const approveDeposit = async (deposit: Deposit) => {
    setProcessingId(deposit.id);
    try {
      await updateDocument('deposits', deposit.id, { status: 'approved' });
      const profile = await getDocument('profiles', deposit.user_id);
      const currentBalance = profile?.wallet_balance || 0;
      const newBalance = currentBalance + deposit.amount;
      await updateDocument('profiles', deposit.user_id, { wallet_balance: newBalance });
      await addDocument('transactions', {
        user_id: deposit.user_id,
        type: 'deposit',
        amount: deposit.amount,
        balance_after: newBalance,
        description: `Deposit via ${deposit.network.toUpperCase()} approved`,
      });
      await addDocument('notifications', {
        user_id: deposit.user_id,
        title: 'Deposit Approved',
        message: `Your $${deposit.amount.toFixed(2)} deposit has been approved and added to your wallet.`,
        type: 'deposit',
        is_read: false,
      });
      const msg =
        `💰 <b>Deposit Approved</b>\n\n` +
        `<b>User:</b> ${deposit.user_email || 'Unknown'}\n` +
        `<b>Amount:</b> $${deposit.amount.toFixed(2)}\n` +
        `<b>Network:</b> ${deposit.network.toUpperCase()}\n` +
        `<b>Tx Hash:</b> ${deposit.tx_hash}\n` +
        `<b>New Balance:</b> $${newBalance.toFixed(2)}`;
      sendTelegramAdminOnly(msg);
      toast({ title: 'Deposit approved', description: `$${deposit.amount.toFixed(2)} added to user's wallet.` });
      fetchDeposits();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      fetchDeposits();
    } finally {
      setProcessingId(null);
    }
  };

  const rejectDeposit = async () => {
    if (!rejectDialog) return;
    const dep = rejectDialog;
    setProcessingId(dep.id);
    setRejectDialog(null);
    setRejectReason('');
    try {
      await updateDocument('deposits', dep.id, { status: 'rejected', reject_reason: rejectReason.trim() });
      await addDocument('notifications', {
        user_id: dep.user_id,
        title: 'Deposit Rejected',
        message: `Your $${dep.amount.toFixed(2)} deposit was rejected. ${rejectReason ? rejectReason + ' ' : ''}Please contact support for assistance.`,
        type: 'deposit',
        is_read: false,
      });
      const msg =
        `❌ <b>Deposit Rejected</b>\n\n` +
        `<b>User:</b> ${dep.user_email || 'Unknown'}\n` +
        `<b>Amount:</b> $${dep.amount.toFixed(2)}\n` +
        `<b>Network:</b> ${dep.network.toUpperCase()}\n` +
        `<b>Tx Hash:</b> ${dep.tx_hash}\n` +
        (rejectReason ? `<b>Reason:</b> ${rejectReason}\n` : '');
      sendTelegramAdminOnly(msg);
      toast({ title: 'Deposit rejected' });
      fetchDeposits();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      fetchDeposits();
    } finally {
      setProcessingId(null);
    }
  };

  const deleteDeposit = async () => {
    if (!deletingDeposit) return;
    const dep = deletingDeposit;
    setDeletingDeposit(null);
    try {
      await hardDeleteDocument('deposits', dep.id);
      toast({ title: 'Deposit permanently deleted', description: 'The deposit was removed. It will NOT appear in trash.' });
      fetchDeposits();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Copied to clipboard.' });
  };

  const filtered = deposits.filter((d) => {
    const matchSearch =
      !search ||
      d.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      d.tx_hash?.toLowerCase().includes(search.toLowerCase()) ||
      d.sender_wallet?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = deposits.filter((d) => d.status === 'pending');
  const approved = deposits.filter((d) => d.status === 'approved');
  const totalApproved = approved.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deposit Management</h1>
          <p className="text-sm text-slate-500">
            {deleteMode
              ? 'Delete mode: deposits can be permanently removed from this page.'
              : 'Review, approve, or reject user deposit requests.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {deleteMode && (
            <Badge className="bg-red-100 text-red-700 border-red-200">Delete mode</Badge>
          )}
          <Badge variant="outline" className="w-fit">{deposits.length} total</Badge>
          <Button variant="outline" size="sm" onClick={fetchDeposits}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-3xl font-bold">{pending.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Approved</p>
                <p className="text-3xl font-bold">${totalApproved.toFixed(2)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Deposits</p>
                <p className="text-3xl font-bold">{deposits.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by email, tx hash, or wallet..."
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
            <p className="py-8 text-center text-sm text-slate-500">Loading deposits...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No deposits found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((d) => (
                <div key={d.id} className="rounded-lg border border-slate-200 overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                        <DollarSign className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{d.user_email || 'Unknown'}</p>
                          {processingId === d.id && (
                            <span className="text-[10px] text-blue-500 animate-pulse">Processing...</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          ${d.amount.toFixed(2)} via {d.payment_method === 'binance' ? 'BINANCE' : d.network.toUpperCase()} &middot; {new Date(d.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {deleteMode && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Permanently delete deposit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingDeposit(d);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <span className="text-sm font-bold text-slate-900">${d.amount.toFixed(2)}</span>
                      <Badge className={`${STATUS_COLORS[d.status] || 'bg-slate-100 text-slate-700'} text-[10px]`}>
                        {STATUS_LABELS[d.status] || d.status}
                      </Badge>
                      {expanded === d.id ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {expanded === d.id && (
                    <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50/50">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium uppercase text-slate-400">Deposit Details</p>
                          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">User</span>
                              <span className="text-xs font-medium text-slate-900">{d.user_email || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Amount</span>
                              <span className="text-xs font-medium text-slate-900">${d.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Currency</span>
                              <span className="text-xs font-medium text-slate-900">{(d.currency || 'USD').toUpperCase()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Method</span>
                              <Badge variant="outline" className="text-[10px]">{d.payment_method === 'binance' ? 'Binance' : 'Crypto'}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Network</span>
                              <Badge variant="outline" className="text-[10px]">{d.network.toUpperCase()}</Badge>
                            </div>
                            {d.binance_id && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Binance ID</span>
                                <span className="text-xs font-medium text-slate-900">{d.binance_id}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Status</span>
                              <Badge className={`${STATUS_COLORS[d.status] || 'bg-slate-100 text-slate-700'} text-[10px]`}>
                                {STATUS_LABELS[d.status] || d.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Date</span>
                              <span className="text-xs text-slate-900">{new Date(d.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-medium uppercase text-slate-400">Transaction Info</p>
                          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400">{d.payment_method === 'binance' ? 'Order ID' : 'Tx Hash'}</span>
                              <div className="flex items-center gap-1.5">
                                <code className="text-[10px] font-mono text-slate-700 break-all flex-1">{d.tx_hash}</code>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0" onClick={() => copyToClipboard(d.tx_hash)}>
                                  <Copy className="h-3 w-3 text-slate-400" />
                                </Button>
                              </div>
                            </div>
                            {d.sender_wallet && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400">Sender Wallet</span>
                                <div className="flex items-center gap-1.5">
                                  <code className="text-[10px] font-mono text-slate-700 break-all flex-1">{d.sender_wallet}</code>
                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0" onClick={() => copyToClipboard(d.sender_wallet!)}>
                                    <Copy className="h-3 w-3 text-slate-400" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {d.screenshot_url && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium uppercase text-slate-400">Payment Screenshot</p>
                          <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <a
                              href={d.screenshot_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ImageIcon className="h-3.5 w-3.5" />
                              View Screenshot
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <div className="mt-2 rounded-md overflow-hidden border border-slate-100 max-h-64">
                              <img
                                src={d.screenshot_url}
                                alt="Payment screenshot"
                                className="w-full h-auto object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-end gap-2 pt-2">
                        {d.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() => approveDeposit(d)}
                              disabled={processingId === d.id}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectDialog(d)}
                              disabled={processingId === d.id}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Rejecting <strong>${rejectDialog?.amount.toFixed(2)}</strong> deposit from{' '}
              <strong>{rejectDialog?.network.toUpperCase()}</strong> by{' '}
              <strong>{rejectDialog?.user_email || 'Unknown'}</strong>.
            </p>
            <div className="space-y-2">
              <Label>Reason for rejection (optional)</Label>
              <Textarea
                placeholder="Explain why this deposit is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <p className="text-[10px] text-slate-400">
                User will receive a notification to contact support.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={rejectDeposit}
              disabled={processingId === rejectDialog?.id}
            >
              {processingId === rejectDialog?.id ? 'Rejecting...' : 'Reject Deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingDeposit} onOpenChange={() => setDeletingDeposit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete this deposit?
            </p>
            <div className="rounded-lg border border-slate-200 p-3 space-y-1">
              <p className="text-xs text-slate-600"><strong>User:</strong> {deletingDeposit?.user_email || 'Unknown'}</p>
              <p className="text-xs text-slate-600"><strong>Amount:</strong> ${deletingDeposit?.amount.toFixed(2)}</p>
              <p className="text-xs text-slate-600"><strong>Network:</strong> {deletingDeposit?.network.toUpperCase()}</p>
            </div>
            <p className="text-[10px] text-red-500">
              Warning: This permanently deletes the deposit. It will NOT go to trash and cannot be restored. The admin deposit total will decrease, but the user&apos;s wallet balance will remain unchanged.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDeposit(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteDeposit}>
              <Trash2 className="mr-1 h-4 w-4" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
