'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchCollection, addDocument, deleteDocument, updateDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, ChevronDown, ChevronRight, Upload, X } from 'lucide-react';

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
  const [newCurSymbol, setNewCurSymbol] = useState('');
  const [newCurLogo, setNewCurLogo] = useState('');
  const [newNetCurrency, setNewNetCurrency] = useState('');
  const [newNetName, setNewNetName] = useState('');
  const [newNetSymbol, setNewNetSymbol] = useState('');
  const [newWalletNetwork, setNewWalletNetwork] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletLabel, setNewWalletLabel] = useState('');
  const [saving, setSaving] = useState(false);

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

  const addCurrency = async () => {
    if (!newCurName || !newCurSymbol) return;
    setSaving(true);
    try {
      await addDocument('currencies', {
        name: newCurName.trim(),
        symbol: newCurSymbol.trim().toUpperCase(),
        logo_url: newCurLogo.trim() || '',
        is_active: true,
        sort_order: currencies.length,
      });
      toast({ title: 'Currency added' });
      setNewCurName(''); setNewCurSymbol(''); setNewCurLogo('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const removeCurrency = async (id: string) => {
    await deleteDocument('currencies', id);
    currencies.filter(c => c.network_id === id).forEach(n => deleteDocument('networks', n.id));
    wallets.filter(w => w.currency_id === id).forEach(w => deleteDocument('wallet_addresses', w.id));
    fetchData();
  };

  const toggleCurrency = async (id: string, active: boolean) => {
    await updateDocument('currencies', id, { is_active: active });
    fetchData();
  };

  const addNetwork = async (currencyId: string) => {
    if (!newNetName || !newNetSymbol) return;
    setSaving(true);
    try {
      const existingNets = networks.filter(n => n.currency_id === currencyId);
      await addDocument('networks', {
        currency_id: currencyId,
        name: newNetName.trim(),
        symbol: newNetSymbol.trim().toUpperCase(),
        is_active: true,
        sort_order: existingNets.length,
      });
      toast({ title: 'Network added' });
      setNewNetName(''); setNewNetSymbol('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const removeNetwork = async (id: string) => {
    await deleteDocument('networks', id);
    wallets.filter(w => w.network_id === id).forEach(w => deleteDocument('wallet_addresses', w.id));
    fetchData();
  };

  const toggleNetwork = async (id: string, active: boolean) => {
    await updateDocument('networks', id, { is_active: active });
    fetchData();
  };

  const addWallet = async (currencyId: string, networkId: string) => {
    if (!newWalletAddress) return;
    setSaving(true);
    try {
      await addDocument('wallet_addresses', {
        currency_id: currencyId,
        network_id: networkId,
        address: newWalletAddress.trim(),
        label: newWalletLabel.trim() || '',
      });
      toast({ title: 'Wallet address added' });
      setNewWalletAddress(''); setNewWalletLabel('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
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
        {/* Add Currency */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Add Currency</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input placeholder="e.g. USDT" value={newCurName} onChange={(e) => setNewCurName(e.target.value)} /></div>
            <div className="space-y-1"><Label>Symbol</Label><Input placeholder="e.g. USDT" value={newCurSymbol} onChange={(e) => setNewCurSymbol(e.target.value)} /></div>
            <div className="space-y-1">
              <Label>Logo URL (optional)</Label>
              <Input placeholder="https://... or emoji like 🔗" value={newCurLogo} onChange={(e) => setNewCurLogo(e.target.value)} />
              {newCurLogo && (
                <div className="flex items-center gap-2 mt-1">
                  {newCurLogo.startsWith('http') ? (
                    <img src={newCurLogo} alt="" className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <span className="text-xl">{newCurLogo}</span>
                  )}
                  <span className="text-xs text-slate-500">Preview</span>
                </div>
              )}
            </div>
            <Button onClick={addCurrency} disabled={!newCurName || !newCurSymbol || saving} className="w-full">
              {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}Add Currency
            </Button>
          </CardContent>
        </Card>

        {/* Currencies List */}
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
                        cur.logo_url.startsWith('http') ? (
                          <img src={cur.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <span className="text-2xl">{cur.logo_url}</span>
                        )
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{cur.symbol?.charAt(0)}</div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{cur.name}</p>
                        <p className="text-xs text-slate-500">{cur.symbol} &middot; {curNetworks.length} networks</p>
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
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">{net.name}</span>
                                <span className="text-xs text-slate-400">({net.symbol})</span>
                              </div>
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
                              <Button size="sm" className="h-8" onClick={() => addWallet(cur.id, net.id)} disabled={!newWalletAddress || newWalletNetwork !== net.id || saving}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex gap-2">
                        <Input placeholder="Network name (e.g. TRC20)" value={newNetCurrency === cur.id ? newNetName : ''} onChange={(e) => { setNewNetCurrency(cur.id); setNewNetName(e.target.value); }} className="text-xs" />
                        <Input placeholder="Symbol" value={newNetCurrency === cur.id ? newNetSymbol : ''} onChange={(e) => { setNewNetCurrency(cur.id); setNewNetSymbol(e.target.value); }} className="text-xs w-24" />
                        <Button size="sm" className="h-8" onClick={() => addNetwork(cur.id)} disabled={!newNetName || !newNetSymbol || newNetCurrency !== cur.id || saving}>
                          <Plus className="h-3 w-3" /> Add Network
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
