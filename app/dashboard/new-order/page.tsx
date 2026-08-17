'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Wallet,

  ClipboardPaste,
  FileText,
  ShoppingBag,
  ArrowRight,
  Info,
} from 'lucide-react';
import { addDocument, updateDocument, fetchCollection } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { sendTelegramMessage, setTelegramChatIds } from '@/lib/telegram';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

const DEFAULT_PRICE_PER_ITEM = 1.00;
const DEFAULT_SERVICE_FEE = 0.15;
const DEFAULT_MIN_DEPOSIT = 20;

interface ParsedUrl {
  url: string;
  valid: boolean;
  domain: string;
}

function parseUrls(raw: string): ParsedUrl[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      let url = line;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      let domain = '';
      let valid = false;
      try {
        const parsed = new URL(url);
        domain = parsed.hostname;
        valid = domain.includes('.') && domain.length > 3;
      } catch {
        valid = false;
      }
      return { url: line, valid, domain };
    });
}

function generateOrderCode(): string {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}-${timestamp}${random}`;
}

export default function NewOrderPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pricePerItem, setPricePerItem] = useState(DEFAULT_PRICE_PER_ITEM);
  const [serviceFee, setServiceFee] = useState(DEFAULT_SERVICE_FEE);
  const [minDeposit, setMinDeposit] = useState(DEFAULT_MIN_DEPOSIT);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  useEffect(() => {
    fetchCollection('pricing_settings')
      .then((data) => {
        if (data && data.length > 0) {
          const p = data[0];
          setPricePerItem(p.base_price ?? 1);
          setServiceFee(p.service_fee ?? 0.15);
          setMinDeposit(p.min_deposit || 20);
        }
      })
      .catch(() => {});

    fetchCollection('admin_settings')
      .then((data) => {
        if (data && data.length > 0) {
          const s = data[0];
          setTelegramChatIds(s.admin_telegram_id || '', s.provider_telegram_id || '');
        }
      })
      .catch(() => {});
  }, []);

  const parsedUrls = useMemo(() => parseUrls(urlInput), [urlInput]);
  const validUrls = useMemo(() => parsedUrls.filter((u) => u.valid), [parsedUrls]);
  const invalidUrls = useMemo(() => parsedUrls.filter((u) => !u.valid), [parsedUrls]);
  const itemCount = validUrls.length;
  const totalCost = itemCount * pricePerItem + (itemCount > 0 ? serviceFee : 0);
  const walletBalance = profile?.wallet_balance ?? 0;
  const hasInsufficientFunds = itemCount > 0 && totalCost > walletBalance;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrlInput((prev) => (prev ? prev + '\n' + text : text));
      toast({ title: 'Pasted', description: 'Clipboard content added to the textarea.' });
    } catch {
      toast({
        title: 'Paste failed',
        description: 'Could not read clipboard. Please paste manually.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    if (itemCount === 0) {
      toast({
        title: 'No valid URLs',
        description: 'Please paste at least one valid review URL.',
        variant: 'destructive',
      });
      return;
    }
    if (hasInsufficientFunds) {
      toast({
        title: 'Insufficient balance',
        description: 'Please add funds to your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    setConfirmOpen(false);

    try {
      const orderCode = generateOrderCode();
      const newBalance = walletBalance - totalCost;

      const orderId = await addDocument('orders', {
        user_id: user.uid,
        order_code: orderCode,
        status: 'pending',
        total_amount: totalCost,
        item_count: itemCount,
        notes: notes.trim() || null,
      });

      const orderItems = validUrls.map((u) => ({
        user_id: user.uid,
        order_id: orderId,
        review_url: u.url,
        status: 'pending',
      }));

      const savedItemIds = await Promise.all(orderItems.map((item) => addDocument('order_items', item)));

      await Promise.all(savedItemIds.map((itemId, idx) =>
        addDocument('provider_tasks', {
          order_id: orderId,
          order_item_id: itemId,
          provider_id: null,
          status: 'pending',
          review_url: validUrls[idx]?.url || '',
        })
      ));

      await updateDocument('profiles', user.uid, { wallet_balance: newBalance });

      await addDocument('transactions', {
        user_id: user.uid,
        type: 'order_payment',
        amount: -totalCost,
        balance_after: newBalance,
        description: `Payment for order ${orderCode} (${itemCount} items)`,
      });

      await addDocument('notifications', {
        user_id: user.uid,
        title: 'Order Created',
        message: `Your order ${orderCode} with ${itemCount} review${itemCount > 1 ? 's' : ''} has been submitted for processing.`,
        type: 'order',
        is_read: false,
      });

      const telegramMsg = [
        '🛒 <b>New Order</b>',
        '',
        `👤 User: ${user.email}`,
        `📋 Order: <code>${orderCode}</code>`,
        `🔗 Reviews: ${itemCount}`,
        `💵 Total: $${totalCost.toFixed(2)}`,
        notes.trim() ? `📝 Notes: ${notes.trim()}` : '',
        '',
        'Status: ⏳ Pending',
      ].filter(Boolean).join('\n');
      sendTelegramMessage(telegramMsg).catch(() => {});

      await refreshProfile();

      toast({
        title: 'Order submitted!',
        description: `Order ${orderCode} created with ${itemCount} item${itemCount > 1 ? 's' : ''}. $${totalCost.toFixed(2)} deducted from your wallet.`,
      });

      setUrlInput('');
      setNotes('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({
        title: 'Order failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }, [user, itemCount, totalCost, walletBalance, hasInsufficientFunds, validUrls, notes, refreshProfile]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Order</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit review URLs for dispute. Each review costs ${pricePerItem.toFixed(2)} + ${serviceFee.toFixed(2)} service fee.
        </p>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-slate-900 to-slate-800 shadow-card">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20">
              <Wallet className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Current Wallet Balance</p>
              <p className="text-xl font-bold text-white">${walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="bg-teal-500 text-white hover:bg-teal-600"
          >
            <Link href="/dashboard/add-funds">
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Funds
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Review URLs</CardTitle>
              <CardDescription>
                Paste review URLs below — one per line. We&apos;ll validate each one.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handlePaste}>
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Paste
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="urls">Review URLs</Label>
            <Textarea
              id="urls"
              placeholder={"https://www.google.com/maps/review/...\nhttps://www.google.com/maps/review/...\nhttps://www.yelp.com/biz/..."}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="min-h-48 font-mono text-sm"
            />
          </div>

          {parsedUrls.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {itemCount} valid
                </Badge>
                {invalidUrls.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {invalidUrls.length} invalid
                  </Badge>
                )}
              </div>

              {invalidUrls.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">
                    The following URLs appear invalid (must contain a domain):
                  </p>
                  <ul className="mt-2 space-y-1">
                    {invalidUrls.map((u, i) => (
                      <li key={i} className="font-mono text-xs text-red-600">
                        • {u.url}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validUrls.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-600">Valid URLs detected:</p>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {validUrls.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Link2 className="h-3 w-3 shrink-0 text-teal-500" />
                        <span className="truncate font-mono text-slate-600">{u.url}</span>
                        <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                          {u.domain}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasInsufficientFunds && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Insufficient wallet balance</p>
                <p className="text-xs text-amber-700">
                  You need ${totalCost.toFixed(2)} but have ${walletBalance.toFixed(2)}. Please add ${(totalCost - walletBalance).toFixed(2)} more.
                </p>
              </div>
              <Button asChild size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
                <Link href="/dashboard/add-funds">
                  Add Funds
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-slate-400">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any context about these reviews..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20"
            />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500">Items</p>
              <p className="text-lg font-bold text-slate-900">{itemCount}</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <p className="text-xs text-slate-500">Base / item</p>
              <p className="text-lg font-bold text-slate-900">${pricePerItem.toFixed(2)}</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <p className="text-xs text-slate-500">Service fee</p>
              <p className="text-lg font-bold text-slate-900">${serviceFee.toFixed(2)}</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <p className="text-xs text-slate-500">Total ({itemCount} item{itemCount !== 1 ? 's' : ''})</p>
              <p className="text-lg font-bold text-teal-600">${totalCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 mb-4">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
            <span className="text-xs text-slate-600 leading-relaxed">
              I agree to the <a href="/terms" target="_blank" className="text-teal-600 underline font-medium">Terms &amp; Conditions</a> and <a href="/refund" target="_blank" className="text-teal-600 underline font-medium">Refund Policy</a>.
            </span>
          </div>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={itemCount === 0 || hasInsufficientFunds || submitting || !agreeTerms}
                className="bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Review &amp; Submit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Order</DialogTitle>
                <DialogDescription>
                  Please review your order summary before submitting. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Order Summary</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total review URLs</span>
                      <span className="font-semibold text-slate-900">{itemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base price</span>
                      <span className="font-semibold text-slate-900">${pricePerItem.toFixed(2)} × {itemCount} = ${(pricePerItem * itemCount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service fee</span>
                      <span className="font-semibold text-slate-900">${serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base">
                      <span className="font-medium text-slate-700">Total cost</span>
                      <span className="font-bold text-teal-600">${totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current balance</span>
                      <span className="font-semibold text-slate-900">${walletBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Balance after order</span>
                      <span className="font-semibold text-slate-900">
                        ${(walletBalance - totalCost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
                  <button
                    type="button"
                    onClick={() => setNoticeOpen(!noticeOpen)}
                    className="flex items-start gap-3 w-full text-left"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-bold text-amber-800 flex items-center gap-1">
                        Important Notice
                        <span className={`text-xs font-normal transition-transform ${noticeOpen ? 'rotate-90' : ''}`}>▶</span>
                      </p>
                    </div>
                  </button>
                  {noticeOpen && (
                    <div className="mt-2 ml-8 rounded-md border border-amber-200 bg-amber-100/60 p-3">
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Reviews older than <span className="font-bold underline">1 month</span> are <span className="font-bold underline">not guaranteed</span> to be removed. We will attempt the removal process, but if the review is not removed, we are <span className="font-bold underline">not responsible</span>.
                      </p>
                      <p className="text-sm text-amber-800 leading-relaxed mt-2">
                        Please order at your own risk for reviews older than 1 month.
                      </p>
                    </div>
                  )}
                </div>

                {notes.trim() && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Notes</span>
                    </div>
                    <p className="text-sm text-slate-600">{notes}</p>
                  </div>
                )}

                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-500">URLs to be submitted:</p>
                  {validUrls.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">{i + 1}.</span>
                      <Link2 className="h-3 w-3 shrink-0 text-teal-500" />
                      <span className="truncate font-mono text-slate-600">{u.url}</span>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex-col gap-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the <a href="/terms" target="_blank" className="text-teal-600 underline">Terms &amp; Conditions</a> and <a href="/refund" target="_blank" className="text-teal-600 underline">Refund Policy</a>.
                  </span>
                </label>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !agreeTerms}
                    className="bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600"
                  >
                    {submitting ? 'Submitting...' : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm &amp; Pay ${totalCost.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
