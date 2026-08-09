'use client';

import { useEffect, useState } from 'react';
import { fetchCollection, updateDocument, addDocument, getDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  network: string;
  tx_hash: string;
  sender_wallet: string | null;
  status: string;
  created_at: string;
  user_email?: string;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<Deposit | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDeposits = async () => {
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
    } catch {}
  };

  useEffect(() => { fetchDeposits(); }, []);

  const approveDeposit = async (deposit: Deposit) => {
    setProcessing(deposit.id);
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
        message: `Your $${deposit.amount.toFixed(2)} deposit has been approved. Balance updated.`,
        type: 'deposit',
        is_read: false,
      });
      toast({ title: 'Deposit approved', description: `$${deposit.amount.toFixed(2)} added to user's wallet.` });
      fetchDeposits();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const rejectDeposit = async () => {
    if (!rejectDialog) return;
    setProcessing(rejectDialog.id);
    try {
      await updateDocument('deposits', rejectDialog.id, { status: 'rejected' });
      await addDocument('notifications', {
        user_id: rejectDialog.user_id,
        title: 'Deposit Rejected',
        message: `Your $${rejectDialog.amount.toFixed(2)} deposit was rejected. ${rejectReason || ''}`,
        type: 'deposit',
        is_read: false,
      });
      toast({ title: 'Deposit rejected' });
      setRejectDialog(null);
      setRejectReason('');
      fetchDeposits();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const pending = deposits.filter(d => d.status === 'pending');
  const totalApproved = deposits.filter(d => d.status === 'approved').reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deposit Management</h1>
        <p className="text-sm text-slate-500">Review and approve user deposit requests.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card"><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-500">Pending</p><p className="text-3xl font-bold">{pending.length}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50"><Clock className="h-6 w-6 text-amber-500" /></div>
          </div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-500">Total Approved</p><p className="text-3xl font-bold">${totalApproved.toFixed(2)}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50"><DollarSign className="h-6 w-6 text-green-500" /></div>
          </div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-500">Total Requests</p><p className="text-3xl font-bold">{deposits.length}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50"><DollarSign className="h-6 w-6 text-blue-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">All Deposits</CardTitle></CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No deposits yet.</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{d.user_email || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">${d.amount.toFixed(2)} via {d.network.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">TX: {d.tx_hash}</p>
                    <p className="text-[10px] text-slate-400">{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[d.status] || 'bg-slate-100 text-slate-700'}>{d.status}</Badge>
                    {d.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => approveDeposit(d)} disabled={processing === d.id}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { setRejectDialog(d); }} disabled={processing === d.id}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Deposit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Rejecting ${rejectDialog?.amount.toFixed(2)} deposit from {rejectDialog?.network.toUpperCase()}</p>
            <Input placeholder="Reason for rejection (optional)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={rejectDeposit} disabled={processing === rejectDialog?.id}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
