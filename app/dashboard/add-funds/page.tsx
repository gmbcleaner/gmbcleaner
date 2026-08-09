'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Copy, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const networks = [
  { id: 'trc20', name: 'USDT TRC20', icon: '🔗' },
  { id: 'bep20', name: 'USDT BEP20', icon: '🔗' },
  { id: 'erc20', name: 'USDT ERC20', icon: '🔗' },
  { id: 'btc', name: 'Bitcoin (BTC)', icon: '₿' },
  { id: 'eth', name: 'Ethereum (ETH)', icon: 'Ξ' },
];

const walletAddresses: Record<string, string> = {
  trc20: 'TXyz1234567890abcdef',
  bep20: '0x1234567890abcdef1234567890abcdef12345678',
  erc20: '0x1234567890abcdef1234567890abcdef12345678',
  btc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  eth: '0x1234567890abcdef1234567890abcdef12345678',
};

export default function AddFundsPage() {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('trc20');
  const [txHash, setTxHash] = useState('');
  const [senderWallet, setSenderWallet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);

  const minAmount = 20;
  const parsedAmount = parseFloat(amount) || 0;
  const isValid = parsedAmount >= minAmount && txHash.trim().length > 5;

  const handleSubmit = async () => {
    if (!user || !isValid) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from('deposits').insert({
        user_id: user.id,
        amount: parsedAmount,
        network,
        tx_hash: txHash.trim(),
        sender_wallet: senderWallet.trim() || null,
        status: 'pending',
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Deposit Request Submitted',
        message: `Your $${parsedAmount.toFixed(2)} deposit request via ${network.toUpperCase()} is pending review.`,
        type: 'deposit',
        is_read: false,
      });

      toast({ title: 'Deposit submitted!', description: 'Your payment is being verified. This may take 10-15 minutes.' });
      setAmount('');
      setTxHash('');
      setSenderWallet('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit deposit.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast({ title: 'Copied', description: 'Wallet address copied to clipboard.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Funds</h1>
        <p className="text-sm text-slate-500">Fund your wallet with crypto to start submitting review disputes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deposit Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Make a Deposit</CardTitle>
            <CardDescription>Minimum deposit: ${minAmount}. Send crypto and submit your transaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" min={minAmount} step="0.01" placeholder={`${minAmount}.00`} value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8" />
              </div>
              {parsedAmount > 0 && parsedAmount < minAmount && (
                <p className="text-xs text-red-500">Minimum deposit is ${minAmount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {networks.map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.icon} {n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {network && walletAddresses[network] && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                <p className="text-xs font-medium text-teal-700 mb-2">Send exactly ${parsedAmount >= minAmount ? parsedAmount.toFixed(2) : '0.00'} to:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-white px-3 py-2 text-xs font-mono text-slate-700 border border-slate-200 break-all">{walletAddresses[network]}</code>
                  <Button size="icon" variant="outline" className="shrink-0" onClick={() => copyAddress(walletAddresses[network])}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-[10px] text-teal-600">Only send {networks.find(n => n.id === network)?.name} to this address</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Transaction Hash (TX ID)</Label>
              <Input placeholder="Paste your transaction hash here" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Sender Wallet <span className="text-muted-foreground">(optional)</span></Label>
              <Input placeholder="Your sending wallet address" value={senderWallet} onChange={(e) => setSenderWallet(e.target.value)} />
            </div>

            <Button onClick={handleSubmit} disabled={!isValid || submitting} className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Deposit Request'}
            </Button>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Payment verification may take 10-15 minutes. You will be notified once your deposit is approved.</p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">How to Deposit</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Select your preferred crypto network' },
                  { step: '2', text: 'Copy the wallet address and send your payment' },
                  { step: '3', text: 'Paste the transaction hash (TX ID) in the form' },
                  { step: '4', text: 'Submit and wait for admin approval (10-15 min)' },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 shrink-0">{s.step}</div>
                    <p className="text-sm text-slate-600">{s.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Supported Networks</h3>
              <div className="space-y-2">
                {networks.map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{n.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{n.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Available</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
