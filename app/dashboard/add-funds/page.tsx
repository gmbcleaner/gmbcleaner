'use client';

import { useState, useEffect } from 'react';
import { Wallet, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { addDocument, fetchCollection } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WalletAddr { id: string; network: string; address: string; label: string; }
interface NetworkInfo { id: string; name: string; symbol: string; is_active: boolean; }

export default function AddFundsPage() {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('');
  const [txHash, setTxHash] = useState('');
  const [senderWallet, setSenderWallet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wallets, setWallets] = useState<WalletAddr[]>([]);
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [minDeposit, setMinDeposit] = useState(20);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    Promise.all([
      fetchCollection('wallet_addresses').catch(() => []),
      fetchCollection('network_settings').catch(() => []),
      fetchCollection('pricing_settings').catch(() => []),
    ]).then(([w, n, p]) => {
      setWallets((w as WalletAddr[]) || []);
      const activeNetworks = (n as NetworkInfo[]) || [];
      setNetworks(activeNetworks);
      if (activeNetworks.length > 0 && !network) setNetwork(activeNetworks[0].id);
      if (p && p.length > 0) setMinDeposit(p[0].min_deposit || 20);
    });
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const isValid = parsedAmount >= minDeposit && txHash.trim().length > 5;
  const activeWallet = wallets.find((w) => w.network === network);

  const handleSubmit = async () => {
    if (!user || !isValid) return;
    setSubmitting(true);
    try {
      await addDocument('deposits', {
        user_id: user.uid,
        amount: parsedAmount,
        network,
        tx_hash: txHash.trim(),
        sender_wallet: senderWallet.trim() || null,
        status: 'pending',
      });
      await addDocument('notifications', {
        user_id: user.uid,
        title: 'Deposit Submitted',
        message: `Your $${parsedAmount.toFixed(2)} deposit via ${network.toUpperCase()} is pending review.`,
        type: 'deposit',
        is_read: false,
      });
      toast({ title: 'Deposit submitted', description: 'Your deposit is pending admin approval.' });
      setAmount(''); setTxHash(''); setSenderWallet('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(network);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Funds</h1>
        <p className="text-sm text-slate-500">Deposit cryptocurrency to fund your wallet. Minimum deposit: ${minDeposit}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Deposit Details</CardTitle>
            <CardDescription>Select network and enter deposit information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger><SelectValue placeholder="Select network" /></SelectTrigger>
                <SelectContent>
                  {networks.filter(n => n.is_active).map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.name} ({n.symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeWallet && (
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                <p className="text-xs font-medium text-teal-700 mb-2">Send {networks.find(n => n.id === network)?.symbol || network.toUpperCase()} to this address:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all text-xs font-mono text-slate-700">{activeWallet.address}</code>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyAddress(activeWallet.address)}>
                    {copied === network ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {activeWallet.label && <p className="mt-1 text-[10px] text-teal-600">{activeWallet.label}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" min={minDeposit} step="0.01" placeholder={`${minDeposit}.00`} value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8" />
              </div>
              {parsedAmount > 0 && parsedAmount < minDeposit && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Minimum deposit is ${minDeposit}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Transaction Hash (TX ID)</Label>
              <Input placeholder="Paste your transaction hash here" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Sender Wallet Address (optional)</Label>
              <Input placeholder="Your sending wallet address" value={senderWallet} onChange={(e) => setSenderWallet(e.target.value)} />
            </div>

            <Button onClick={handleSubmit} disabled={!isValid || submitting} className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white">
              {submitting ? 'Submitting...' : 'Submit Deposit'}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">1</div>
              <div><p className="text-sm font-medium text-slate-900">Select your network</p><p className="text-xs text-slate-500">Choose the cryptocurrency network you want to use.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">2</div>
              <div><p className="text-sm font-medium text-slate-900">Send crypto</p><p className="text-xs text-slate-500">Send the desired amount to the wallet address shown.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">3</div>
              <div><p className="text-sm font-medium text-slate-900">Submit details</p><p className="text-xs text-slate-500">Paste your transaction hash and submit for verification.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">4</div>
              <div><p className="text-sm font-medium text-slate-900">Funds credited</p><p className="text-xs text-slate-500">Once approved, your wallet balance updates instantly.</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
