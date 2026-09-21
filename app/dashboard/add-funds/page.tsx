'use client';

import { useState, useEffect, useRef } from 'react';
import { Wallet, Copy, CheckCircle2, AlertTriangle, Clock, X, Send, ShieldCheck, Check } from 'lucide-react';
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

function isNightTime(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const start = 23 * 60;
  const end = 6 * 60 + 30;
  if (start > end) return totalMinutes >= start || totalMinutes < end;
  return totalMinutes >= start && totalMinutes < end;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

const COOLDOWN_MINUTES = 30;

export default function AddFundsPage() {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [minDeposit, setMinDeposit] = useState(20);
  const [binanceId, setBinanceId] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'result'>('form');
  const [depositId, setDepositId] = useState('');
  const [processingTimeLeft, setProcessingTimeLeft] = useState(0);
  const [resultStatus, setResultStatus] = useState<'approved' | 'rejected' | 'timeout' | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, s] = await Promise.all([
          fetchCollection('pricing_settings').catch(() => []),
          fetchCollection('admin_settings').catch(() => []),
        ]);
        if (p && p.length > 0) setMinDeposit(p[0].min_deposit || 20);
        if (s && s.length > 0) {
          setTelegramChatIds(s[0].admin_telegram_id || '', s[0].provider_telegram_id || '');
          setBinanceId(s[0].binance_id || '');
        }
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkCooldown = async () => {
      try {
        const deposits = await fetchCollection('deposits', [
          { field: 'user_id', op: '==', value: user.uid },
        ]);
        const now = Date.now();
        const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
        let latestPending: Date | null = null;
        for (const dep of deposits || []) {
          if (dep.status === 'pending' && dep.submitted_at) {
            const submitted = new Date(dep.submitted_at).getTime();
            if (submitted > now - cooldownMs) {
              if (!latestPending || submitted > latestPending.getTime()) {
                latestPending = new Date(submitted);
              }
            }
          }
        }
        if (latestPending) {
          const end = latestPending.getTime() + cooldownMs;
          if (end > now) {
            setCooldownLeft(end - now);
          }
        }
      } catch {}
    };
    checkCooldown();
  }, [user]);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [cooldownLeft > 0]);

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

  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount >= minDeposit;
  const isCooldownActive = cooldownLeft > 0;

  const copyAddress = () => {
    navigator.clipboard.writeText(binanceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied', description: 'Binance ID copied to clipboard.' });
  };

  const handleSubmit = async () => {
    if (!user || !txHash.trim() || !isValidAmount) return;
    setConfirmOpen(false);

    try {
      const night = isNightTime();

      const depositData = {
        user_id: user.uid,
        user_email: user.email,
        amount: parsedAmount,
        currency: 'USDT',
        network: 'Binance',
        payment_method: 'binance',
        binance_id: binanceId,
        tx_hash: txHash.trim(),
        status: 'pending',
        submitted_at: new Date().toISOString(),
        night_mode: night,
      };

      const docId = await addDocument('deposits', depositData);
      setDepositId(docId);

      await addDocument('notifications', {
        user_id: user.uid,
        title: 'Deposit Submitted',
        message: `Your $${parsedAmount.toFixed(2)} deposit via Binance is being processed.`,
        type: 'deposit',
        is_read: false,
      });

      const telegramMsg = [
        '💰 <b>New Binance Deposit Request</b>',
        '',
        `👤 User: ${user.email}`,
        `💵 Amount: $${parsedAmount.toFixed(2)}`,
        `🏦 Binance ID: <code>${binanceId}</code>`,
        `🔗 Order ID: <code>${txHash.trim()}</code>`,
        '',
        'Status: ⏳ Pending',
      ].filter(Boolean).join('\n');
      await sendTelegramAdminOnly(telegramMsg);

      setStep('processing');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const resetFlow = () => {
    setStep('form');
    setAmount('');
    setTxHash('');
    setDepositId('');
    setResultStatus(null);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Funds</h1>
        <p className="text-sm text-slate-500">Deposit via Binance to fund your wallet. Minimum deposit: ${minDeposit}</p>
      </div>

      {step === 'form' && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-6">
            {isCooldownActive && (
              <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Deposit Cooldown Active</p>
                    <p className="text-xs text-amber-700">
                      Please wait <span className="font-bold font-mono">{formatCountdown(cooldownLeft)}</span> before submitting another deposit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-sky-50 p-5 space-y-3">
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Step 1 — Send payment to this Binance ID</p>
              {binanceId ? (
                <>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-teal-100">
                    <code className="flex-1 break-all text-sm font-mono text-slate-700 select-all">{binanceId}</code>
                    <Button size="sm" variant="ghost" className="shrink-0 h-8 w-8 p-0" onClick={copyAddress}>
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-teal-600" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-teal-600">Copy this ID and send USDT via Binance. Make sure to send the exact amount you enter below.</p>
                </>
              ) : (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                  Binance ID not configured. Please contact support.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Step 2 — Enter Amount (USD)</Label>
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
                  disabled={isCooldownActive}
                />
              </div>
              {parsedAmount > 0 && parsedAmount < minDeposit && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />Minimum deposit is ${minDeposit}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Step 3 — Transaction / Order ID</Label>
              <Input
                placeholder="Paste your Binance Order ID here"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                disabled={isCooldownActive}
              />
              <p className="text-[11px] text-slate-400">After sending payment, paste the Binance Order ID to confirm.</p>
            </div>

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!isValidAmount || !txHash.trim() || isCooldownActive || !binanceId}
              className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white"
            >
              <Send className="mr-2 h-4 w-4" /> Confirm &amp; Submit
            </Button>
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
                Your payment is being processed. This usually takes 10-20 minutes.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Time remaining</p>
              <p className="text-3xl font-bold text-teal-600 font-mono">{formatCountdown(processingTimeLeft)}</p>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs text-amber-700">
                <strong>Important:</strong> Please do not leave this page. You will be notified once your payment is approved.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-left space-y-2">
              <p className="text-xs font-medium text-slate-700">Deposit Details</p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Amount: <span className="font-semibold text-slate-900">${parsedAmount.toFixed(2)}</span></p>
                <p>Method: <span className="font-semibold text-slate-900">Binance</span></p>
                <p>Binance ID: <span className="font-semibold text-slate-900">{binanceId}</span></p>
                <p>Order ID: <code className="text-[10px] text-slate-600">{txHash}</code></p>
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
                  <p className="mt-2 text-sm text-slate-600">Your deposit could not be verified. Please contact our support team.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetFlow} className="flex-1">Try Again</Button>
                  <Button onClick={() => window.location.href = '/dashboard/support'} className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 text-white">Contact Support</Button>
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
                  <p className="mt-2 text-sm text-slate-600">Your payment is taking longer than expected. Please contact support.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetFlow} className="flex-1">Go Back</Button>
                  <Button onClick={() => window.location.href = '/dashboard/support'} className="flex-1 bg-gradient-to-r from-teal-500 to-sky-500 text-white">Contact Support</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'form' && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">How it works</h3>
            <div className="space-y-3">
              {[
                { n: 1, t: 'Copy Binance ID', d: 'Click the copy button to copy our Binance ID' },
                { n: 2, t: 'Send USDT via Binance', d: `Send exactly the amount you enter (min $${minDeposit})` },
                { n: 3, t: 'Paste Order ID', d: 'Copy the Binance Order/Transaction ID and paste it here' },
                { n: 4, t: 'Wait for approval', d: 'Processing takes 10-20 minutes' },
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
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>Make sure you have sent the payment via Binance before confirming.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-slate-50 border p-3 text-xs space-y-1">
              <p>Amount: <span className="font-semibold">${parsedAmount.toFixed(2)}</span></p>
              <p>Method: <span className="font-semibold">Binance</span></p>
              <p>Binance ID: <span className="font-semibold">{binanceId}</span></p>
              <p>Order ID: <span className="font-semibold">{txHash}</span></p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-3">
            <Button
              onClick={handleSubmit}
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
