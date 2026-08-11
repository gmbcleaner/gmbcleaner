'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Wallet, Copy, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Clock, X, Send, ShieldCheck, ChevronDown } from 'lucide-react';
import { addDocument, fetchCollection, getDocument } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendTelegramAdminOnly, setTelegramChatIds } from '@/lib/telegram';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Currency { id: string; name: string; symbol: string; logo_url: string; is_active: boolean; }
interface Network { id: string; currency_id: string; name: string; symbol: string; is_active: boolean; }
interface WalletAddress { id: string; currency_id: string; network_id: string; address: string; label: string; }

function isNightTime(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const start = 23 * 60;
  const end = 6 * 60 + 30;
  if (start > end) {
    return totalMinutes >= start || totalMinutes < end;
  }
  return totalMinutes >= start && totalMinutes < end;
}

function getTimeUntil630AM(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(6, 30, 0, 0);
  if (now.getHours() >= 6 && (now.getHours() > 6 || now.getMinutes() >= 30)) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

type Step = 'amount' | 'payment' | 'confirming' | 'processing' | 'result';

export default function AddFundsPage() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [minDeposit, setMinDeposit] = useState(20);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletAddress | null>(null);
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [depositId, setDepositId] = useState('');
  const [processingTimeLeft, setProcessingTimeLeft] = useState(0);
  const [nightMode, setNightMode] = useState(false);
  const [resultStatus, setResultStatus] = useState<'approved' | 'rejected' | 'timeout' | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, n, w, p, s] = await Promise.all([
          fetchCollection('currencies'),
          fetchCollection('networks'),
          fetchCollection('wallet_addresses'),
          fetchCollection('pricing_settings').catch(() => []),
          fetchCollection('admin_settings').catch(() => []),
        ]);
        setCurrencies((c as Currency[]) || []);
        setNetworks((n as Network[]) || []);
        setWallets((w as WalletAddress[]) || []);
        if (p && p.length > 0) setMinDeposit(p[0].min_deposit || 20);
        if (s && s.length > 0) {
          setTelegramChatIds(s[0].admin_telegram_id || '', s[0].provider_telegram_id || '');
        }
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (step === 'processing' && depositId) {
      const timerMs = 15 * 60 * 1000;
      setProcessingTimeLeft(timerMs);
      const startTime = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = timerMs - elapsed;
        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          setProcessingTimeLeft(0);
          setResultStatus('timeout');
          setStep('result');
          return;
        }
        setProcessingTimeLeft(remaining);
      }, 1000);

      pollRef.current = setInterval(async () => {
        try {
          const dep = await getDocument('deposits', depositId);
          if (dep) {
            if (dep.status === 'approved') {
              clearInterval(timerRef.current!);
              clearInterval(pollRef.current!);
              setResultStatus('approved');
              setStep('result');
              await refreshProfile();
            } else if (dep.status === 'rejected') {
              clearInterval(timerRef.current!);
              clearInterval(pollRef.current!);
              setResultStatus('rejected');
              setStep('result');
            }
          }
        } catch {}
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, depositId, refreshProfile]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (networkRef.current && !networkRef.current.contains(e.target as Node)) setNetworkOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount >= minDeposit;
  const networksForCurrency = networks.filter(n => n.currency_id === selectedCurrency?.id);
  const walletsForNetwork = wallets.filter(w => w.network_id === selectedNetwork?.id && w.currency_id === selectedCurrency?.id);

  useEffect(() => {
    if (selectedCurrency && networksForCurrency.length === 1) {
      setSelectedNetwork(networksForCurrency[0]);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    if (selectedNetwork && walletsForNetwork.length > 0) {
      setSelectedWallet(walletsForNetwork[0]);
    }
  }, [selectedNetwork]);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Address copied', description: 'Wallet address copied to clipboard.' });
  };

  const handleConfirmPayment = async () => {
    if (!user || !txHash.trim() || !selectedCurrency || !selectedNetwork || !selectedWallet) return;
    setConfirmOpen(false);

    try {
      const night = isNightTime();
      setNightMode(night);

      const depositData: any = {
        user_id: user.uid,
        user_email: user.email,
        amount: parsedAmount,
        currency: selectedCurrency.symbol,
        currency_id: selectedCurrency.id,
        network: selectedNetwork.name,
        network_id: selectedNetwork.id,
        wallet_address: selectedWallet.address,
        tx_hash: txHash.trim(),
        status: night ? 'pending' : 'pending',
        submitted_at: new Date().toISOString(),
        night_mode: night,
      };

      const docId = await addDocument('deposits', depositData);
      setDepositId(docId);

      await addDocument('notifications', {
        user_id: user.uid,
        title: 'Deposit Submitted',
        message: `Your $${parsedAmount.toFixed(2)} ${selectedCurrency.symbol} deposit via ${selectedNetwork.name} is being processed.`,
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
        night ? '🌙 Night deposit - Will be processed after 6:30 AM' : '',
        '',
        `Status: ⏳ Pending`,
      ].filter(Boolean).join('\n');

      await sendTelegramAdminOnly(telegramMsg);

      setStep('processing');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const resetFlow = () => {
    setStep('amount');
    setAmount('');
    setTxHash('');
    setSelectedCurrency(null);
    setSelectedNetwork(null);
    setSelectedWallet(null);
    setDepositId('');
    setResultStatus(null);
    setNightMode(false);
  };

  const currentNetworkIndex = networksForCurrency.indexOf(selectedNetwork!);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Funds</h1>
        <p className="text-sm text-slate-500">Deposit cryptocurrency to fund your wallet. Minimum deposit: ${minDeposit}</p>
      </div>

      {step === 'amount' && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={minDeposit}
                  step="0.01"
                  placeholder={`${minDeposit}.00`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-lg"
                  autoFocus
                />
              </div>
              {parsedAmount > 0 && parsedAmount < minDeposit && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />Minimum deposit is ${minDeposit}
                </p>
              )}
            </div>
            <Button
              onClick={() => isValidAmount && setStep('payment')}
              disabled={!isValidAmount}
              className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white"
            >
              Pay Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'payment' && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Crypto Payment</h2>
                <p className="text-sm text-slate-500">Amount: <span className="font-semibold text-slate-900">${parsedAmount.toFixed(2)}</span></p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('amount')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Change
              </Button>
            </div>

            <div className="space-y-3" ref={currencyRef}>
              <Label>Select Currency</Label>
              {currencies.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No currencies available. Contact admin.</p>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setCurrencyOpen(!currencyOpen); setNetworkOpen(false); }}
                    className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {selectedCurrency ? (
                      <span className="flex items-center gap-3">
                        {selectedCurrency.logo_url ? (
                          selectedCurrency.logo_url.startsWith('http') || selectedCurrency.logo_url.startsWith('data:') ? (
                            <img src={selectedCurrency.logo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            <span className="text-lg">{selectedCurrency.logo_url}</span>
                          )
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{selectedCurrency.symbol?.charAt(0)}</span>
                        )}
                        {selectedCurrency.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">-- Select Currency --</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                  {currencyOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                      {currencies.map(cur => (
                        <button
                          key={cur.id}
                          type="button"
                          onClick={() => {
                            setSelectedCurrency(cur);
                            setSelectedNetwork(null);
                            setSelectedWallet(null);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${selectedCurrency?.id === cur.id ? 'bg-teal-50 text-teal-700' : 'text-slate-900'}`}
                        >
                          {cur.logo_url ? (
                            cur.logo_url.startsWith('http') || cur.logo_url.startsWith('data:') ? (
                              <img src={cur.logo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              <span className="text-lg">{cur.logo_url}</span>
                            )
                          ) : (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{cur.symbol?.charAt(0)}</span>
                          )}
                          {cur.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedCurrency && (
              <div className="space-y-3" ref={networkRef}>
                <Label>Select Network</Label>
                {networksForCurrency.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No networks available for {selectedCurrency.symbol}.</p>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setNetworkOpen(!networkOpen); setCurrencyOpen(false); }}
                      className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {selectedNetwork ? (
                        <span>{selectedNetwork.name}</span>
                      ) : (
                        <span className="text-slate-400">-- Select Network --</span>
                      )}
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                    {networkOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                        {networksForCurrency.map(net => (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => {
                              setSelectedNetwork(net);
                              setSelectedWallet(null);
                              setNetworkOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${selectedNetwork?.id === net.id ? 'bg-teal-50 text-teal-700' : 'text-slate-900'}`}
                          >
                            {net.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedNetwork && selectedWallet && (
              <div className="rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-sky-50 p-5 space-y-3">
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Send {selectedCurrency.symbol} to this address</p>
                <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-teal-100">
                  <code className="flex-1 break-all text-xs font-mono text-slate-700 select-all">{selectedWallet.address}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={() => copyAddress(selectedWallet.address)}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-teal-600" />}
                  </Button>
                </div>
                {selectedWallet.label && <p className="text-[11px] text-teal-600">{selectedWallet.label}</p>}
                <p className="text-[11px] text-slate-500">Make sure to send only {selectedCurrency.symbol} on {selectedNetwork.name} network.</p>
              </div>
            )}

            {selectedNetwork && walletsForNetwork.length === 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                No wallet address configured for {selectedNetwork.name}. Contact support.
              </div>
            )}

            {selectedNetwork && selectedWallet && (
              <div className="space-y-3">
                <Button
                  onClick={() => setConfirmOpen(true)}
                  className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white"
                >
                  <Send className="mr-2 h-4 w-4" /> I&apos;ve Sent Payment
                </Button>
                <p className="text-[11px] text-center text-slate-400">
                  Click after you have sent the payment from your wallet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-teal-500" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Processing Payment</h2>
              <p className="mt-2 text-sm text-slate-500">
                {nightMode
                  ? 'Your payment was submitted during night hours (11 PM - 6:30 AM). It will be approved after 6:30 AM.'
                  : 'Your payment is being processed. This usually takes 10-20 minutes.'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Time remaining</p>
              <p className="text-3xl font-bold text-teal-600 font-mono">{formatCountdown(processingTimeLeft)}</p>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs text-amber-700">
                <strong>Important:</strong> Please do not leave this page. You will be notified once your payment is approved. If you close this page, you can check your deposit status in Billing.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-left space-y-2">
              <p className="text-xs font-medium text-slate-700">Deposit Details</p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Amount: <span className="font-semibold text-slate-900">${parsedAmount.toFixed(2)}</span></p>
                <p>Currency: <span className="font-semibold text-slate-900">{selectedCurrency?.symbol}</span></p>
                <p>Network: <span className="font-semibold text-slate-900">{selectedNetwork?.name}</span></p>
                <p>TX Hash: <code className="text-[10px] text-slate-600">{txHash}</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'result' && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center space-y-6">
            {resultStatus === 'approved' && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-700">Congratulations!</h2>
                  <p className="mt-2 text-sm text-slate-600">Your deposit of <span className="font-semibold">${parsedAmount.toFixed(2)}</span> has been approved and credited to your wallet.</p>
                </div>
                <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-700">Your new wallet balance is visible on your dashboard.</p>
                </div>
                <Button onClick={resetFlow} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
                  Make Another Deposit
                </Button>
              </>
            )}

            {resultStatus === 'rejected' && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="h-10 w-10 text-red-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-700">Payment Not Verified</h2>
                  <p className="mt-2 text-sm text-slate-600">Your deposit could not be verified. Please contact our support team for assistance.</p>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-700">
                    <strong>Contact Support:</strong> support@gmbcleaner.online
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetFlow} className="flex-1">
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.href = '/dashboard/support'} className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 text-white">
                    Contact Support
                  </Button>
                </div>
              </>
            )}

            {resultStatus === 'timeout' && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-10 w-10 text-amber-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-700">Processing Timeout</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {nightMode
                      ? 'Your payment is still being processed. It will be approved after 6:30 AM. Please check back later or contact support if the issue persists.'
                      : 'Your payment is taking longer than expected. Please contact our support team for assistance.'}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm text-amber-700">
                    <strong>Contact Support:</strong> support@gmbcleaner.online
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetFlow} className="flex-1">
                    Go Back
                  </Button>
                  <Button onClick={() => window.location.href = '/dashboard/support'} className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 text-white">
                    Contact Support
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step !== 'processing' && step !== 'result' && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">How it works</h3>
            <div className="space-y-3">
              {[
                { n: 1, t: 'Enter amount', d: `Minimum deposit is $${minDeposit}` },
                { n: 2, t: 'Select currency & network', d: 'Choose from dropdown menus' },
                { n: 3, t: 'Copy wallet address & send crypto', d: 'Send to the address shown' },
                { n: 4, t: 'Confirm with transaction ID', d: 'Paste your TX hash' },
                { n: 5, t: 'Wait for approval', d: 'Processing takes 10-20 minutes' },
              ].map((item) => (
                <div key={item.n} className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 shrink-0">{item.n}</div>
                  <div>
                    <p className="text-xs font-medium text-slate-900">{item.t}</p>
                    <p className="text-[11px] text-slate-500">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-[11px] text-amber-700">
                <strong>Night hours (11 PM - 6:30 AM):</strong> Deposits made during this time will be processed after 6:30 AM.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Paste your transaction hash (TX ID) to confirm you have sent the payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-slate-50 border p-3 text-xs space-y-1">
              <p>Amount: <span className="font-semibold">${parsedAmount.toFixed(2)}</span></p>
              <p>Currency: <span className="font-semibold">{selectedCurrency?.symbol}</span></p>
              <p>Network: <span className="font-semibold">{selectedNetwork?.name}</span></p>
            </div>
            <div className="space-y-2">
              <Label>Transaction Hash (TX ID) *</Label>
              <Input
                placeholder="Paste your transaction hash here"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                autoFocus
              />
              {txHash.trim().length === 0 && (
                <p className="text-xs text-red-500">Transaction ID is required</p>
              )}
            </div>
            {isNightTime() && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-700">
                  <strong>Night deposit:</strong> Your payment was submitted between 11 PM - 6:30 AM. It will be approved after 6:30 AM. Please be patient.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-3">
            <Button
              onClick={handleConfirmPayment}
              disabled={!txHash.trim()}
              className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white"
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> Confirm &amp; Submit
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
