'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchCollection, addDocument, deleteDocument, updateDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronRight, Upload, X, AlertCircle } from 'lucide-react';

interface Currency { id: string; name: string; logo_url: string; is_active: boolean; }
interface Network { id: string; currency_id: string; name: string; is_active: boolean; }
interface WalletAddress { id: string; currency_id: string; network_id: string; address: string; label: string; }

export default function AdminWalletsPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [expandedCurrency, setExpandedCurrency] = useState<string | null>(null);
  const [dbError, setDbError] = useState('');

  const [newCurName, setNewCurName] = useState('');
  const [newCurLogo, setNewCurLogo] = useState('');
  const [addNetFor, setAddNetFor] = useState('');
  const [newNetName, setNewNetName] = useState('');
  const [addAddrFor, setAddAddrFor] = useState('');
  const [newAddr, setNewAddr] = useState('');
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [c, n, w] = await Promise.all([
        fetchCollection('currencies').catch(() => []),
        fetchCollection('networks').catch(() => []),
        fetchCollection('wallet_addresses').catch(() => []),
      ]);
      setCurrencies(Array.isArray(c) ? c : []);
      setNetworks(Array.isArray(n) ? n : []);
      setWallets(Array.isArray(w) ? w : []);
    } catch (e: any) {
      setDbError(e.message || 'Failed to load data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'Max 2MB', variant: 'destructive' }); return; }
    const reader = new FileReader();
    reader.onloadend = () => setNewCurLogo(reader.result as string);
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
      setNewCurName(''); setNewCurLogo('');
      if (logoRef.current) logoRef.current.value = '';
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const toggleCurrency = async (id: string, active: boolean) => {
    setCurrencies(prev => prev.map(c => c.id === id ? { ...c, is_active: active } : c));
    updateDocument('currencies', id, { is_active: active }).catch(() => {});
  };

  const removeCurrency = async (id: string) => {
    setCurrencies(prev => prev.filter(c => c.id !== id));
    setNetworks(prev => prev.filter(n => n.currency_id !== id));
    setWallets(prev => prev.filter(w => w.currency_id !== id));
    try {
      const curNets = networks.filter(n => n.currency_id === id);
      const curWallets = wallets.filter(w => w.currency_id === id);
      await Promise.all([
        deleteDocument('currencies', id),
        ...curNets.map(n => deleteDocument('networks', n.id)),
        ...curWallets.map(w => deleteDocument('wallet_addresses', w.id)),
      ]);
    } catch {}
  };

  const addNetwork = async (currencyId: string) => {
    if (!newNetName) return;
    try {
      await addDocument('networks', {
        currency_id: currencyId,
        name: newNetName.trim(),
        symbol: newNetName.trim().toUpperCase(),
        is_active: true,
        sort_order: networks.filter(n => n.currency_id === currencyId).length,
      });
      toast({ title: 'Network added' });
      setNewNetName(''); setAddNetFor('');
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const toggleNetwork = async (id: string, active: boolean) => {
    setNetworks(prev => prev.map(n => n.id === id ? { ...n, is_active: active } : n));
    updateDocument('networks', id, { is_active: active }).catch(() => {});
  };

  const removeNetwork = async (id: string) => {
    setNetworks(prev => prev.filter(n => n.id !== id));
    setWallets(prev => prev.filter(w => w.network_id !== id));
    try {
      const netWallets = wallets.filter(w => w.network_id === id);
      await Promise.all([
        deleteDocument('networks', id),
        ...netWallets.map(w => deleteDocument('wallet_addresses', w.id)),
      ]);
    } catch {}
  };

  const addWallet = async (currencyId: string, networkId: string) => {
    if (!newAddr) return;
    try {
      await addDocument('wallet_addresses', {
        currency_id: currencyId,
        network_id: networkId,
        address: newAddr.trim(),
        label: newAddrLabel.trim() || '',
      });
      toast({ title: 'Wallet address added' });
      setNewAddr(''); setNewAddrLabel(''); setAddAddrFor('');
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const removeWallet = async (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
    deleteDocument('wallet_addresses', id).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Currencies & Wallets</h1>
        <p className="text-sm text-slate-500">Add currencies, then expand to add networks and wallet addresses.</p>
      </div>

      {dbError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{dbError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Add Currency</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Currency Name *</Label>
              <Input placeholder="e.g. USDT" value={newCurName} onChange={(e) => setNewCurName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCurrency()} />
            </div>
            <div className="space-y-1">
              <Label>Logo (optional)</Label>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              {newCurLogo ? (
                <div className="relative inline-block">
                  <img src={newCurLogo} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                  <button onClick={() => { setNewCurLogo(''); if (logoRef.current) logoRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
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
                <div key={cur.id} className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedCurrency(isExpanded ? null : cur.id)}>
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      {cur.logo_url ? (
                        <img src={cur.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{cur.name?.charAt(0)}</div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{cur.name}</p>
                        <p className="text-xs text-slate-500">{curNetworks.length} networks &middot; {wallets.filter(w => w.currency_id === cur.id).length} addresses</p>
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
                    <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/50">
                      {curNetworks.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-2">No networks yet. Add one below.</p>
                      )}
                      {curNetworks.map((net) => {
                        const netWallets = wallets.filter(w => w.network_id === net.id);
                        return (
                          <div key={net.id} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                            <div className="flex items-center justify-between">
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
                              <div key={w.id} className="flex items-center justify-between rounded border border-slate-100 p-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-mono text-slate-600 truncate">{w.address}</p>
                                  {w.label && <p className="text-[10px] text-slate-400">{w.label}</p>}
                                </div>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => removeWallet(w.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            {addAddrFor === net.id ? (
                              <div className="space-y-2 border-t border-slate-100 pt-2">
                                <Input placeholder="Wallet address" value={newAddr} onChange={(e) => setNewAddr(e.target.value)} className="text-xs" autoFocus />
                                <Input placeholder="Label (optional)" value={newAddrLabel} onChange={(e) => setNewAddrLabel(e.target.value)} className="text-xs" />
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-7 text-xs" onClick={() => addWallet(cur.id, net.id)} disabled={!newAddr}>Save</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddAddrFor(''); setNewAddr(''); setNewAddrLabel(''); }}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => { setAddAddrFor(net.id); setNewAddr(''); setNewAddrLabel(''); }}
                                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-1">
                                <Plus className="h-3 w-3" /> Add wallet address
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {addNetFor === cur.id ? (
                        <div className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Network name</Label>
                            <Input placeholder="e.g. TRC20" value={newNetName} onChange={(e) => setNewNetName(e.target.value)} className="text-xs" autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && addNetwork(cur.id)} />
                          </div>
                          <Button size="sm" className="h-8" onClick={() => addNetwork(cur.id)} disabled={!newNetName}>Add</Button>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddNetFor(''); setNewNetName(''); }}>Cancel</Button>
                        </div>
                      ) : (
                        <button onClick={() => { setAddNetFor(cur.id); setNewNetName(''); }}
                          className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700">
                          <Plus className="h-4 w-4" /> Add network
                        </button>
                      )}
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
