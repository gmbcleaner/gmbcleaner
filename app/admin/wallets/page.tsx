'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchCollection, addDocument, deleteDocument, updateDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronRight, Upload, X } from 'lucide-react';

interface Currency {
  id: string;
  name: string;
  symbol: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
}

interface Network {
  id: string;
  currency_id: string;
  name: string;
  symbol: string;
  is_active: boolean;
  sort_order: number;
}

interface WalletAddress {
  id: string;
  currency_id: string;
  network_id: string;
  address: string;
  label: string;
}

export default function AdminWalletsPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [expandedCurrency, setExpandedCurrency] = useState<string | null>(null);

  const [newCurName, setNewCurName] = useState('');
  const [newCurLogo, setNewCurLogo] = useState('');
  const [newNetCurrency, setNewNetCurrency] = useState('');
  const [newNetName, setNewNetName] = useState('');
  const [newWalletNetwork, setNewWalletNetwork] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletLabel, setNewWalletLabel] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [c, n, w] = await Promise.all([
        fetchCollection('currencies').catch(() => []),
        fetchCollection('networks').catch(() => []),
        fetchCollection('wallet_addresses').catch(() => []),
      ]);
      setCurrencies((c as Currency[]) || []);
      setNetworks((n as Network[]) || []);
      setWallets((w as WalletAddress[]) || []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 2MB allowed.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCurLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addCurrency = async () => {
    if (!newCurName) return;
    try {
      const id = await addDocument('currencies', {
        name: newCurName.trim(),
        symbol: newCurName.trim().toUpperCase(),
        logo_url: newCurLogo || '',
        is_active: true,
        sort_order: currencies.length,
      });
      toast({ title: 'Currency added' });
      setNewCurName('');
      setNewCurLogo('');
      if (logoRef.current) logoRef.current.value = '';
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const removeCurrency = async (id: string) => {
    try {
      await deleteDocument('currencies', id);
      const curNetworks = networks.filter(n => n.currency_id === id);
      const curWallets = wallets.filter(w => w.currency_id === id);
      await Promise.all([
        ...curNetworks.map(n => deleteDocument('networks', n.id)),
        ...curWallets.map(w => deleteDocument('wallet_addresses', w.id)),
      ]);
      fetchData();
    } catch {}
  };

  const toggleCurrency = async (id: string, active: boolean) => {
    await updateDocument('currencies', id, { is_active: active });
    fetchData();
  };

  const addNetwork = async (currencyId: string) => {
    if (!newNetName) return;
    try {
      const existingNets = networks.filter(n => n.currency_id === currencyId);
      await addDocument('networks', {
        currency_id: currencyId,
        name: newNetName.trim(),
        symbol: newNetName.trim().toUpperCase(),
        is_active: true,
        sort_order: existingNets.length,
      });
      toast({ title: 'Network added' });
      setNewNetName('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const removeNetwork = async (id: string) => {
    try {
      await deleteDocument('networks', id);
      const netWallets = wallets.filter(w => w.network_id === id);
      await Promise.all(netWallets.map(w => deleteDocument('wallet_addresses', w.id)));
      fetchData();
    } catch {}
  };

  const toggleNetwork = async (id: string, active: boolean) => {
    await updateDocument('networks', id, { is_active: active });
    fetchData();
  };

  const addWallet = async (currencyId: string, networkId: string) => {
    if (!newWalletAddress) return;
    try {
      await addDocument('wallet_addresses', {
        currency_id: currencyId,
        network_id: networkId,
        address: newWalletAddress.trim(),
        label: newWalletLabel.trim() || '',
      });
      toast({ title: 'Wallet address added' });
      setNewWalletAddress('');
      setNewWalletLabel('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const removeWallet = async (id: string) => {
    await deleteDocument('wallet_addresses', id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Currencies & Wallets</h1>
        <p className="text-sm text-slate-500">Manage currencies, networks, and deposit wallet addresses.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Add Currency</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input placeholder="e.g. USDT" value={newCurName} onChange={(e) => setNewCurName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Logo (optional)</Label>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              {newCurLogo ? (
                <div className="relative inline-block">
                  <img src={newCurLogo} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                  <button onClick={() => { setNewCurLogo(''); if (logoRef.current) logoRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => logoRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-4 text-sm text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors">
                  <Upload className="h-4 w-4" />Click to upload logo
                </button>
              )}
            </div>
            <Button onClick={addCurrency} disabled={!newCurName} className="w-full">
              <Plus className="mr-2 h-3 w-3" />Add Currency
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">All Currencies</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {currencies.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No currencies yet.</p>}
            {currencies.map((cur) => {
              const curNetworks = networks.filter(n => n.currency_id === cur.id);
              const isExpanded = expandedCurrency === cur.id;
              return (
                <div key={cur.id} className="rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50" onClick={() => setExpandedCurrency(isExpanded ? null : cur.id)}>
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      {cur.logo_url ? (
                        <img src={cur.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{cur.name?.charAt(0)}</div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{cur.name}</p>
                        <p className="text-xs text-slate-500">{curNetworks.length} networks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant={cur.is_active ? 'default' : 'outline'} onClick={() => toggleCurrency(cur.id, !cur.is_active)}>
                        {cur.is_active ? 'Active' : 'Off'}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeCurrency(cur.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50/50">
                      {curNetworks.map((net) => {
                        const netWallets = wallets.filter(w => w.network_id === net.id);
                        return (
                          <div key={net.id} className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-900">{net.name}</span>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant={net.is_active ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => toggleNetwork(net.id, !net.is_active)}>
                                  {net.is_active ? 'On' : 'Off'}
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => removeNetwork(net.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {netWallets.map((w) => (
                              <div key={w.id} className="flex items-center justify-between rounded border border-slate-100 p-2 mb-1">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-mono text-slate-600 truncate">{w.address}</p>
                                  {w.label && <p className="text-[10px] text-slate-400">{w.label}</p>}
                                </div>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => removeWallet(w.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                              <Input placeholder="Wallet address" value={newWalletNetwork === net.id ? newWalletAddress : ''} onChange={(e) => { setNewWalletNetwork(net.id); setNewWalletAddress(e.target.value); }} className="text-xs" />
                              <Input placeholder="Label" value={newWalletNetwork === net.id ? newWalletLabel : ''} onChange={(e) => { setNewWalletNetwork(net.id); setNewWalletLabel(e.target.value); }} className="text-xs w-24" />
                              <Button size="sm" className="h-8" onClick={() => addWallet(cur.id, net.id)} disabled={!newWalletAddress || newWalletNetwork !== net.id}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex gap-2">
                        <Input placeholder="Network name (e.g. TRC20)" value={newNetCurrency === cur.id ? newNetName : ''} onChange={(e) => { setNewNetCurrency(cur.id); setNewNetName(e.target.value); }} className="text-xs" />
                        <Button size="sm" className="h-8" onClick={() => addNetwork(cur.id)} disabled={!newNetName || newNetCurrency !== cur.id}>
                          <Plus className="h-3 w-3" /> Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
