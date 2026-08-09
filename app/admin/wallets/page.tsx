'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';

interface WalletAddress {
  id: string;
  network: string;
  address: string;
  label: string;
}

interface NetworkSetting {
  id: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [networks, setNetworks] = useState<NetworkSetting[]>([]);
  const [newNetwork, setNewNetwork] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: w } = await supabase.from('wallet_addresses').select('*').order('network');
        setWallets((w as WalletAddress[]) || []);
        const { data: n } = await supabase.from('network_settings').select('*').order('name');
        setNetworks((n as NetworkSetting[]) || []);
      } catch {}
    };
    fetchData();
  }, []);

  const addWallet = async () => {
    if (!newNetwork || !newAddress) return;
    setSaving(true);
    try {
      await supabase.from('wallet_addresses').insert({
        network: newNetwork,
        address: newAddress,
        label: newLabel || newNetwork,
      });
      toast({ title: 'Wallet added' });
      setNewNetwork(''); setNewAddress(''); setNewLabel('');
      const { data } = await supabase.from('wallet_addresses').select('*');
      setWallets((data as WalletAddress[]) || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const removeWallet = async (id: string) => {
    await supabase.from('wallet_addresses').delete().eq('id', id);
    setWallets(wallets.filter(w => w.id !== id));
  };

  const toggleNetwork = async (id: string, active: boolean) => {
    await supabase.from('network_settings').update({ is_active: active }).eq('id', id);
    setNetworks(networks.map(n => n.id === id ? { ...n, is_active: active } : n));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wallet & Network Settings</h1>
        <p className="text-sm text-slate-500">Manage deposit wallet addresses and supported networks.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Deposit Wallet Addresses</CardTitle>
            <CardDescription>These addresses are shown to users when making deposits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{w.label || w.network}</p>
                  <p className="text-xs font-mono text-slate-500 truncate">{w.address}</p>
                </div>
                <Button size="icon" variant="ghost" className="shrink-0 text-red-500 hover:text-red-600" onClick={() => removeWallet(w.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4">
              <p className="text-xs font-medium text-slate-500">Add New Wallet</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="Network (e.g., trc20)" value={newNetwork} onChange={(e) => setNewNetwork(e.target.value)} />
                <Input placeholder="Label (optional)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
              </div>
              <Input placeholder="Wallet address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              <Button size="sm" onClick={addWallet} disabled={!newNetwork || !newAddress || saving}>
                {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}Add Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Network Settings</CardTitle>
            <CardDescription>Enable or disable crypto networks for deposits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {networks.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{n.name}</p>
                  <p className="text-xs text-slate-500">{n.symbol}</p>
                </div>
                <Button size="sm" variant={n.is_active ? 'default' : 'outline'} onClick={() => toggleNetwork(n.id, !n.is_active)}>
                  {n.is_active ? 'Active' : 'Disabled'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
