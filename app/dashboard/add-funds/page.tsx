'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Wallet, Copy, CheckCircle2, AlertTriangle, Upload, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { addDocument, fetchCollection } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { uploadToImgbb } from '@/lib/imgbb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendTelegramMessage } from '@/lib/telegram';

interface Currency { id: string; name: string; symbol: string; logo_url: string; is_active: boolean; }
interface Network { id: string; currency_id: string; name: string; symbol: string; is_active: boolean; }
interface WalletAddress { id: string; currency_id: string; network_id: string; address: string; label: string; }

export default function AddFundsPage() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<'amount' | 'currency' | 'network' | 'address' | 'proof'>('amount');
  const [amount, setAmount] = useState('');
  const [minDeposit, setMinDeposit] = useState(20);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletAddress | null>(null);
  const [txHash, setTxHash] = useState('');
  const [senderWallet, setSenderWallet] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dbError, setDbError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [c, n, w, p] = await Promise.all([
        fetchCollection('currencies'),
        fetchCollection('networks'),
        fetchCollection('wallet_addresses'),
        fetchCollection('pricing_settings').catch(() => []),
      ]);
      const activeCurrencies = ((c as Currency[]) || []);
      setCurrencies(activeCurrencies);
      setNetworks((n as Network[]) || []);
      setWallets((w as WalletAddress[]) || []);
      if (p && p.length > 0) setMinDeposit(p[0].min_deposit || 20);
      setDbError('');
    } catch (err: any) {
      setDbError(err.message || 'Failed to load data. Check database rules.');
    }
  }, []);

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchData]);

  useEffect(() => {
    if (step === 'currency') fetchData();
  }, [step, fetchData]);

  useEffect(() => {
    if (step === 'address' && walletsForNetwork.length > 0 && !selectedWallet) {
      setSelectedWallet(walletsForNetwork[0]);
    }
  }, [step]);

  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount >= minDeposit;
  const networksForCurrency = networks.filter(n => n.currency_id === selectedCurrency?.id);
  const walletsForNetwork = wallets.filter(w => w.network_id === selectedNetwork?.id && w.currency_id === selectedCurrency?.id);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB allowed.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setScreenshotUrl(base64);
      setScreenshotPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotUrl('');
    setScreenshotPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!user || !isValidAmount || !selectedCurrency || !selectedNetwork || !selectedWallet || !txHash.trim()) return;
    setSubmitting(true);
    try {
      let uploadedScreenshotUrl = screenshotUrl || null;
      if (screenshotUrl && screenshotUrl.startsWith('data:')) {
        toast({ title: 'Uploading screenshot...', description: 'Please wait.' });
        const base64Only = screenshotUrl.split(',')[1];
        uploadedScreenshotUrl = await uploadToImgbb(base64Only);
      }

      await addDocument('deposits', {
        user_id: user.uid,
        user_email: user.email,
        amount: parsedAmount,
        currency: selectedCurrency.symbol,
        currency_id: selectedCurrency.id,
        network: selectedNetwork.name,
        network_id: selectedNetwork.id,
        wallet_address: selectedWallet.address,
        tx_hash: txHash.trim(),
        sender_wallet: senderWallet.trim() || null,
        screenshot_url: uploadedScreenshotUrl,
        status: 'pending',
      });

      await addDocument('notifications', {
        user_id: user.uid,
        title: 'Deposit Submitted',
        message: `Your $${parsedAmount.toFixed(2)} ${selectedCurrency.symbol} deposit via ${selectedNetwork.name} is pending review.`,
        type: 'deposit',
        is_read: false,
      });

      const telegramMsg = [
        '💰 <b>New Deposit Request</b>',
        '',
        `👤 User: ${user.email}`,
        `💵 Amount: $${parsedAmount.toFixed(2)}`,
        `🪙 Currency: ${selectedCurrency.name} (${selectedCurrency.symbol})`,
        `🌐 Network: ${selectedNetwork.name}`,
        `📍 Wallet: <code>${selectedWallet.address}</code>`,
        `🔗 TX Hash: <code>${txHash.trim()}</code>`,
        senderWallet ? `📤 Sender: <code>${senderWallet.trim()}</code>` : '',
        '',
        `Status: ⏳ Pending Admin Approval`,
      ].filter(Boolean).join('\n');

      if (uploadedScreenshotUrl) {
        await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'photo', photo: uploadedScreenshotUrl, caption: telegramMsg }),
        });
      } else {
        await sendTelegramMessage(telegramMsg);
      }

      toast({ title: 'Deposit submitted', description: 'Your deposit is pending admin approval.' });
      await refreshProfile();
      setStep('amount');
      setAmount(''); setTxHash(''); setSenderWallet('');
      removeScreenshot();
      setSelectedCurrency(null); setSelectedNetwork(null); setSelectedWallet(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepIndex = ['amount', 'currency', 'network', 'address', 'proof'].indexOf(step);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Funds</h1>
        <p className="text-sm text-slate-500">Deposit cryptocurrency to fund your wallet. Minimum deposit: ${minDeposit}</p>
      </div>

      {dbError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Database Error</p>
          <p>{dbError}</p>
          <p className="mt-2 text-xs">Make sure Firebase Realtime Database rules are set to allow read/write.</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500">
        {['Amount', 'Currency', 'Network', 'Address', 'Proof'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i <= stepIndex ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {i + 1}
            </div>
            <span className={i <= stepIndex ? 'text-slate-900 font-medium' : ''}>{label}</span>
            {i < 4 && <ArrowRight className="h-3 w-3 text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {step === 'amount' && 'Enter Amount'}
              {step === 'currency' && 'Select Currency'}
              {step === 'network' && 'Select Network'}
              {step === 'address' && 'Wallet Address'}
              {step === 'proof' && 'Submit Proof'}
            </CardTitle>
            <CardDescription>
              {step === 'amount' && `Minimum deposit is $${minDeposit}`}
              {step === 'currency' && 'Choose the cryptocurrency to deposit'}
              {step === 'network' && `Select a network for ${selectedCurrency?.symbol}`}
              {step === 'address' && `Send ${selectedNetwork?.name} to this address`}
              {step === 'proof' && 'Upload payment proof and enter transaction details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'amount' && (
              <>
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input type="number" min={minDeposit} step="0.01" placeholder={`${minDeposit}.00`} value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8 text-lg" autoFocus />
                  </div>
                  {parsedAmount > 0 && parsedAmount < minDeposit && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Minimum deposit is ${minDeposit}</p>
                  )}
                </div>
                <Button onClick={() => isValidAmount && setStep('currency')} disabled={!isValidAmount} className="w-full">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 'currency' && (
              <>
                <div className="space-y-2">
                  {currencies.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No currencies available. Contact admin to add currencies.</p>
                  ) : (
                    <div className="grid gap-2">
                      {currencies.map((cur) => (
                        <button key={cur.id} onClick={() => { setSelectedCurrency(cur); setStep('network'); }}
                          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:bg-slate-50 ${selectedCurrency?.id === cur.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}>
                          {cur.logo_url ? (
                            cur.logo_url.startsWith('http') ? (
                              <img src={cur.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                              <span className="text-2xl">{cur.logo_url}</span>
                            )
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{cur.symbol?.charAt(0)}</div>
                          )}
                          <div><p className="text-sm font-semibold text-slate-900">{cur.name}</p><p className="text-xs text-slate-500">{cur.symbol}</p></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={() => setStep('amount')} className="w-full"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              </>
            )}

            {step === 'network' && (
              <>
                <div className="space-y-2">
                  {networksForCurrency.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No networks available for {selectedCurrency?.symbol}.</p>
                  ) : (
                    <div className="grid gap-2">
                      {networksForCurrency.map((net) => (
                        <button key={net.id} onClick={() => { setSelectedNetwork(net); setStep('address'); }}
                          className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all hover:bg-slate-50 ${selectedNetwork?.id === net.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}>
                          <div><p className="text-sm font-semibold text-slate-900">{net.name}</p><p className="text-xs text-slate-500">{net.symbol}</p></div>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={() => setStep('currency')} className="w-full"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              </>
            )}

            {step === 'address' && (
              <>
                {walletsForNetwork.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No wallet addresses configured for {selectedNetwork?.name}. Contact support.</p>
                ) : (
                  walletsForNetwork.map((w) => (
                    <div key={w.id} className="rounded-lg border border-teal-200 bg-teal-50 p-4 space-y-2">
                      <p className="text-xs font-medium text-teal-700">Send {selectedNetwork?.symbol} to this address:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 break-all text-xs font-mono text-slate-700">{w.address}</code>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyAddress(w.address)}>
                          {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      {w.label && <p className="text-[10px] text-teal-600">{w.label}</p>}
                    </div>
                  ))
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('network')} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                  <Button onClick={() => setStep('proof')} disabled={walletsForNetwork.length === 0} className="flex-1">I&apos;ve sent payment <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </>
            )}

            {step === 'proof' && (
              <>
                <div className="space-y-2">
                  <Label className="text-red-600">Transaction Hash (TX ID) *</Label>
                  <Input placeholder="Paste your transaction hash here" value={txHash} onChange={(e) => setTxHash(e.target.value)} className={txHash.trim().length > 0 ? '' : 'border-red-300 focus-visible:ring-red-500'} />
                  {txHash.length === 0 && <p className="text-xs text-red-500">Transaction ID is required for deposit approval</p>}
                </div>
                <div className="space-y-2">
                  <Label>Sender Wallet Address (optional)</Label>
                  <Input placeholder="Your sending wallet address" value={senderWallet} onChange={(e) => setSenderWallet(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Screenshot (optional, max 5MB)</Label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  {screenshotPreview ? (
                    <div className="relative inline-block">
                      <img src={screenshotPreview} alt="Screenshot" className="max-h-40 rounded-lg border" />
                      <button onClick={removeScreenshot} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-6 text-sm text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors">
                      <Upload className="h-5 w-5" />Click to upload screenshot
                    </button>
                  )}
                </div>
                <div className="rounded-lg bg-slate-50 border p-3 text-xs text-slate-600">
                  <p className="font-medium mb-1">Deposit Summary</p>
                  <p>Amount: <span className="font-semibold">${parsedAmount.toFixed(2)}</span></p>
                  <p>Currency: <span className="font-semibold">{selectedCurrency?.name} ({selectedCurrency?.symbol})</span></p>
                  <p>Network: <span className="font-semibold">{selectedNetwork?.name}</span></p>
                  {selectedWallet && <p>To: <code className="text-[10px]">{selectedWallet.address.slice(0, 12)}...{selectedWallet.address.slice(-8)}</code></p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('address')} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                  <Button onClick={handleSubmit} disabled={!txHash.trim() || submitting} className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 text-white">
                    {submitting ? 'Submitting...' : 'Submit Deposit'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">How it works</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">1</div>
              <div><p className="text-sm font-medium text-slate-900">Enter amount</p><p className="text-xs text-slate-500">Specify how much you want to deposit (min ${minDeposit}).</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">2</div>
              <div><p className="text-sm font-medium text-slate-900">Choose currency & network</p><p className="text-xs text-slate-500">Select cryptocurrency and network for deposit.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">3</div>
              <div><p className="text-sm font-medium text-slate-900">Send crypto</p><p className="text-xs text-slate-500">Send to the wallet address shown. Copy it with one click.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">4</div>
              <div><p className="text-sm font-medium text-slate-900">Upload proof</p><p className="text-xs text-slate-500">Enter TX hash, optionally upload screenshot. Admin reviews instantly.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">5</div>
              <div><p className="text-sm font-medium text-slate-900">Funds credited</p><p className="text-xs text-slate-500">Once approved, your wallet balance updates instantly.</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
