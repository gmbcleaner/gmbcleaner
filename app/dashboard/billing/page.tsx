'use client';

import { useEffect, useState } from 'react';
import { fetchCollection } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      try {
        const data = await fetchCollection(
          'transactions',
          [{ field: 'user_id', op: '==', value: user.uid }],
          'created_at'
        );
        setTransactions(data as Transaction[]);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const typeColors: Record<string, string> = {
    deposit: 'bg-green-100 text-green-700',
    order_payment: 'bg-red-100 text-red-700',
    refund: 'bg-blue-100 text-blue-700',
    adjustment: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Transactions</h1>
        <p className="text-sm text-slate-500">View your complete transaction history.</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tx.amount >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      {tx.amount >= 0 ? <ArrowDownRight className="h-5 w-5 text-green-500" /> : <ArrowUpRight className="h-5 w-5 text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400">Balance: ${(tx.balance_after ?? 0).toFixed(2)}</p>
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
