'use client';

import { useEffect, useState } from 'react';
import { fetchCollection, addDocument, updateDocument, getDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

export default function AdminPricingPage() {
  const [pricingId, setPricingId] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState('1.00');
  const [serviceFee, setServiceFee] = useState('0.15');
  const [minDeposit, setMinDeposit] = useState('20');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await fetchCollection('pricing_settings');
        if (data && data.length > 0) {
          const row = data[0];
          setPricingId(row.id);
          setBasePrice(String(row.base_price || 1));
          setServiceFee(String(row.service_fee || 0.15));
          setMinDeposit(String(row.min_deposit || 20));
        }
      } catch {}
    };
    fetchPricing();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        base_price: parseFloat(basePrice),
        service_fee: parseFloat(serviceFee),
        min_deposit: parseFloat(minDeposit),
      };
      if (pricingId) {
        await updateDocument('pricing_settings', pricingId, payload);
      } else {
        const newId = await addDocument('pricing_settings', payload);
        setPricingId(newId);
      }
      toast({ title: 'Pricing updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pricing Settings</h1>
        <p className="text-sm text-slate-500">Configure service pricing and fees.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Service Pricing</CardTitle>
          <CardDescription>These prices are shown to users during order creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Base Price per Item (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Service Fee per Item (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" step="0.01" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Deposit (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" step="1" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="pl-8" />
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-600">
              <strong>Preview:</strong> Each review case costs <strong>${(parseFloat(basePrice) + parseFloat(serviceFee)).toFixed(2)}</strong> (${basePrice} base + ${serviceFee} fee)
            </p>
          </div>
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Pricing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
