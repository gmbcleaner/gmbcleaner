'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Star,
  Trash2,
  Shield,
  MapPin,
  Globe,
  PlayCircle,
  X,
  MessageSquare,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface ServicePricing {
  base: number;
  fee: number;
}

type ServiceType = 'removal' | 'play_store' | 'maps' | 'trustpilot';

interface ReviewEntry {
  id: string;
  text: string;
  stars: number;
}

interface ParsedUrl {
  url: string;
  valid: boolean;
  domain: string;
}

const SERVICES: { id: ServiceType; name: string; icon: any; color: string; description: string }[] = [
  { id: 'removal', name: 'Review Removal', icon: X, color: 'from-red-500 to-rose-500', description: 'Remove negative or fake reviews from Google Maps, Yelp, and other platforms.' },
  { id: 'play_store', name: 'Google Play Store', icon: PlayCircle, color: 'from-emerald-500 to-green-500', description: 'Get positive reviews posted on your Google Play Store app listing.' },
  { id: 'maps', name: 'Google Maps', icon: MapPin, color: 'from-blue-500 to-sky-500', description: 'Get positive reviews posted on your Google Maps business listing.' },
  { id: 'trustpilot', name: 'Trustpilot', icon: Shield, color: 'from-teal-500 to-cyan-500', description: 'Get positive reviews posted on your Trustpilot business profile.' },
];

const TRUSTPILOT_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Spain', 'Italy', 'Brazil', 'India', 'Japan',
  'Other',
];

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

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              star <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function NewOrderPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [service, setService] = useState<ServiceType | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [appLink, setAppLink] = useState('');
  const [businessLink, setBusinessLink] = useState('');
  const [trustpilotCountry, setTrustpilotCountry] = useState('');
  const [reviews, setReviews] = useState<ReviewEntry[]>([{ id: crypto.randomUUID(), text: '', stars: 5 }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [servicePricing, setServicePricing] = useState<Record<ServiceType, ServicePricing>>({
    removal: { base: DEFAULT_PRICE_PER_ITEM, fee: DEFAULT_SERVICE_FEE },
    play_store: { base: DEFAULT_PRICE_PER_ITEM, fee: DEFAULT_SERVICE_FEE },
    maps: { base: DEFAULT_PRICE_PER_ITEM, fee: DEFAULT_SERVICE_FEE },
    trustpilot: { base: DEFAULT_PRICE_PER_ITEM, fee: DEFAULT_SERVICE_FEE },
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const pricePerItem = service ? servicePricing[service].base : DEFAULT_PRICE_PER_ITEM;
  const serviceFee = service ? servicePricing[service].fee : DEFAULT_SERVICE_FEE;

  useEffect(() => {
    fetchCollection('pricing_settings')
      .then((data) => {
        if (data && data.length > 0) {
          const p = data[0];
          setServicePricing({
            removal: {
              base: p.removal_base_price ?? p.base_price ?? 1,
              fee: p.removal_service_fee ?? p.service_fee ?? 0.15,
            },
            play_store: {
              base: p.play_store_base_price ?? p.base_price ?? 1,
              fee: p.play_store_service_fee ?? p.service_fee ?? 0.15,
            },
            maps: {
              base: p.maps_base_price ?? p.base_price ?? 1,
              fee: p.maps_service_fee ?? p.service_fee ?? 0.15,
            },
            trustpilot: {
              base: p.trustpilot_base_price ?? p.base_price ?? 1,
              fee: p.trustpilot_service_fee ?? p.service_fee ?? 0.15,
            },
          });
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

  const validReviews = useMemo(() => {
    if (service === 'removal') return validUrls.length;
    return reviews.filter((r) => r.text.trim().length > 0).length;
  }, [service, validUrls, reviews]);

  const itemCount = service === 'removal' ? validUrls.length : validReviews;
  const totalCost = itemCount * pricePerItem + (itemCount > 0 ? serviceFee : 0);
  const walletBalance = profile?.wallet_balance ?? 0;
  const hasInsufficientFunds = itemCount > 0 && totalCost > walletBalance;

  const addReview = () => {
    setReviews((prev) => [...prev, { id: crypto.randomUUID(), text: '', stars: 5 }]);
  };

  const removeReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const updateReview = (id: string, field: 'text' | 'stars', value: string | number) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrlInput((prev) => (prev ? prev + '\n' + text : text));
      toast({ title: 'Pasted', description: 'Clipboard content added to the textarea.' });
    } catch {
      toast({ title: 'Paste failed', description: 'Could not read clipboard. Please paste manually.', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setAppLink('');
    setBusinessLink('');
    setTrustpilotCountry('');
    setReviews([{ id: crypto.randomUUID(), text: '', stars: 5 }]);
    setNotes('');
    setAgreeTerms(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!user || !service) return;
    if (itemCount === 0) {
      toast({ title: 'No items', description: service === 'removal' ? 'Please paste at least one valid review URL.' : 'Please add at least one review.', variant: 'destructive' });
      return;
    }
    if (hasInsufficientFunds) {
      toast({ title: 'Insufficient balance', description: 'Please add funds to your wallet first.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    setConfirmOpen(false);

    try {
      const orderCode = generateOrderCode();
      const newBalance = walletBalance - totalCost;

      const serviceLabel = SERVICES.find((s) => s.id === service)?.name || service;

      const orderId = await addDocument('orders', {
        user_id: user.uid,
        order_code: orderCode,
        status: 'pending',
        service_type: service,
        total_amount: totalCost,
        item_count: itemCount,
        notes: notes.trim() || null,
      });

      const savedItemIds: string[] = [];

      if (service === 'removal') {
        const items = validUrls.map((u) => ({
          user_id: user.uid,
          order_id: orderId,
          review_url: u.url,
          status: 'pending',
        }));
        const ids = await Promise.all(items.map((item) => addDocument('order_items', item)));
        savedItemIds.push(...ids);

        await Promise.all(ids.map((itemId, idx) =>
          addDocument('provider_tasks', {
            order_id: orderId,
            order_item_id: itemId,
            provider_id: null,
            status: 'pending',
            review_url: validUrls[idx]?.url || '',
          })
        ));
      } else {
        const targetLink = service === 'play_store' ? appLink : businessLink;
        const validReviewEntries = reviews.filter((r) => r.text.trim().length > 0);
        const items = validReviewEntries.map((r) => ({
          user_id: user.uid,
          order_id: orderId,
          review_url: targetLink,
          review_text: r.text.trim(),
          star_rating: r.stars,
          country: service === 'trustpilot' ? trustpilotCountry : null,
          status: 'pending',
        }));
        const ids = await Promise.all(items.map((item) => addDocument('order_items', item)));
        savedItemIds.push(...ids);

        await Promise.all(ids.map((itemId) =>
          addDocument('provider_tasks', {
            order_id: orderId,
            order_item_id: itemId,
            provider_id: null,
            status: 'pending',
            review_url: targetLink,
          })
        ));
      }

      await updateDocument('profiles', user.uid, { wallet_balance: newBalance });

      await addDocument('transactions', {
        user_id: user.uid,
        type: 'order_payment',
        amount: -totalCost,
        balance_after: newBalance,
        description: `Payment for order ${orderCode} (${serviceLabel} - ${itemCount} items)`,
      });

      await addDocument('notifications', {
        user_id: user.uid,
        title: 'Order Created',
        message: `Your ${serviceLabel} order ${orderCode} with ${itemCount} item${itemCount > 1 ? 's' : ''} has been submitted for processing.`,
        type: 'order',
        is_read: false,
      });

      const telegramMsg = [
        '🛒 <b>New Order</b>',
        '',
        `👤 User: ${user.email}`,
        `📋 Order: <code>${orderCode}</code>`,
        `🏷️ Service: ${serviceLabel}`,
        `📝 Items: ${itemCount}`,
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

      resetForm();
      setService(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Order failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }, [user, service, itemCount, totalCost, walletBalance, hasInsufficientFunds, validUrls, reviews, appLink, businessLink, trustpilotCountry, notes, refreshProfile]);

  const canSubmit = itemCount > 0 && !hasInsufficientFunds && agreeTerms && !submitting;

  const getServiceNotice = () => {
    if (service === 'play_store' || service === 'maps' || service === 'trustpilot') {
      return (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-bold text-amber-800">Important Notice</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">Disclaimer:</span> We do <span className="font-bold underline">not guarantee</span> that reviews will stay permanently. Removed reviews are <span className="font-bold underline">not replaced</span>. We are not responsible for any future removal by the platform.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="text-sm font-bold text-amber-800">Important Notice</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-bold">Disclaimer:</span> We do <span className="font-bold underline">not guarantee</span> the removal of any review. We will attempt the dispute process, but success depends on various factors.
            </p>
            <p className="text-sm text-amber-800 leading-relaxed mt-2">
              However, for reviews older than <span className="font-bold underline">1 month</span>, the chances of removal are significantly lower and we are <span className="font-bold underline">not responsible</span> if they are not removed. Please order at your own risk.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getServiceSummaryItems = () => {
    if (service === 'removal') {
      return validUrls.map((u) => (
        <div key={u.url} className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">•</span>
          <Link2 className="h-3 w-3 shrink-0 text-teal-500" />
          <span className="truncate font-mono text-slate-600">{u.url}</span>
        </div>
      ));
    }
    const validReviewEntries = reviews.filter((r) => r.text.trim().length > 0);
    return validReviewEntries.map((r, i) => (
      <div key={r.id} className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">{i + 1}.</span>
        <StarRating value={r.stars} readonly />
        <span className="truncate text-slate-600">{r.text.slice(0, 50)}{r.text.length > 50 ? '...' : ''}</span>
      </div>
    ));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Order</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a service and submit your order. Each item costs ${pricePerItem.toFixed(2)} + ${serviceFee.toFixed(2)} service fee.
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
          <Button asChild variant="secondary" size="sm" className="bg-teal-500 text-white hover:bg-teal-600">
            <Link href="/dashboard/add-funds">
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Funds
            </Link>
          </Button>
        </CardContent>
      </Card>

      {!service ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Choose a Service</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setService(s.id); resetForm(); }}
                  className="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-teal-300 hover:shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 transition-opacity group-hover:opacity-5`} />
                  <div className="relative flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-900">{s.name}</p>
                      <p className="mt-1 text-sm text-slate-500 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={service}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setService(null); resetForm(); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {SERVICES.find((s) => s.id === service)?.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {service === 'removal'
                    ? 'Paste review URLs for dispute — one per line.'
                    : service === 'play_store'
                    ? 'Provide your app link and the reviews you want posted.'
                    : service === 'trustpilot'
                    ? 'Provide your Trustpilot profile and the reviews you want posted.'
                    : 'Provide your Google Maps listing and the reviews you want posted.'}
                </p>
              </div>
            </div>

            {service === 'removal' ? (
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Review URLs</CardTitle>
                      <CardDescription>Paste review URLs below — one per line. We&apos;ll validate each one.</CardDescription>
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
                          {validUrls.length} valid
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
                          <p className="text-xs font-medium text-red-700">The following URLs appear invalid (must contain a domain):</p>
                          <ul className="mt-2 space-y-1">
                            {invalidUrls.map((u, i) => (
                              <li key={i} className="font-mono text-xs text-red-600">• {u.url}</li>
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
                                <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">{u.domain}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {service === 'play_store' ? 'App Link' : 'Business Link'}
                  </CardTitle>
                  <CardDescription>
                    {service === 'play_store'
                      ? 'Paste your Google Play Store app URL.'
                      : service === 'trustpilot'
                      ? 'Paste your Trustpilot business profile URL.'
                      : 'Paste your Google Maps business listing URL.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder={
                        service === 'play_store'
                          ? 'https://play.google.com/store/apps/details?id=...'
                          : service === 'trustpilot'
                          ? 'https://www.trustpilot.com/review/...'
                          : 'https://www.google.com/maps/place/...'
                      }
                      value={service === 'play_store' ? appLink : businessLink}
                      onChange={(e) => service === 'play_store' ? setAppLink(e.target.value) : setBusinessLink(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {service === 'trustpilot' && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-teal-500" />
                    Reviewer Country
                  </CardTitle>
                  <CardDescription>Select the country for the reviewer profile.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={trustpilotCountry} onValueChange={setTrustpilotCountry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRUSTPILOT_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {service !== 'removal' && (
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-teal-500" />
                        Reviews ({reviews.length})
                      </CardTitle>
                      <CardDescription>Add the review texts and star ratings you want posted.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addReview}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Review
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {reviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500">Review {idx + 1}</p>
                          {reviews.length > 1 && (
                            <button
                              onClick={() => removeReview(review.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Star Rating</Label>
                          <StarRating value={review.stars} onChange={(v) => updateReview(review.id, 'stars', v)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Review Text</Label>
                          <Textarea
                            placeholder="Write the review text..."
                            value={review.text}
                            onChange={(e) => updateReview(review.id, 'text', e.target.value)}
                            className="min-h-20 text-sm"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button variant="outline" onClick={addReview} className="w-full border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Review
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card">
              <CardContent className="space-y-4 pt-6">
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
                    <Button disabled={!canSubmit} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600">
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
                            <span className="text-slate-500">Service</span>
                            <span className="font-semibold text-slate-900">{SERVICES.find((s) => s.id === service)?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Total items</span>
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
                            <span className="font-semibold text-slate-900">${(walletBalance - totalCost).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {getServiceNotice()}

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
                        <p className="mb-2 text-xs font-medium text-slate-500">Items to be submitted:</p>
                        {getServiceSummaryItems()}
                      </div>
                    </div>

                    <DialogFooter className="flex-col gap-3">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting || !agreeTerms} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600">
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
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
