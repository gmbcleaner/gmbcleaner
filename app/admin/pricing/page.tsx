'use client';

import { useEffect, useState } from 'react';
import { fetchCollection, addDocument, updateDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

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
          setBasePrice(String(row.base_price ?? 1));
          setServiceFee(String(row.service_fee ?? 0.15));
          setMinDeposit(String(row.min_deposit ?? 20));
        }
      } catch {}
    };
    fetchPricing();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        base_price: parseFloat(basePrice) || 1,
        service_fee: parseFloat(serviceFee) || 0,
        min_deposit: parseFloat(minDeposit) || 20,
      };

      if (pricingId) {
        await updateDocument('pricing_settings', pricingId, payload);
      } else {
        const newId = await addDocument('pricing_settings', payload);
        setPricingId(newId);
      }
      toast({ title: 'Pricing saved successfully' });
    } catch (err: any) {
      toast({ title: 'Error saving pricing', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const base = parseFloat(basePrice) || 0;
  const fee = parseFloat(serviceFee) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pricing Settings</h1>
        <p className="text-sm text-slate-500">Configure service pricing and fees.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Service Pricing</CardTitle>
          <CardDescription>Configure the base price per review item and the service fee.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Base Price per Item (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" step="0.01" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="pl-8" />
              </div>
              <p className="text-xs text-slate-400">Charged per review URL</p>
            </div>
            <div className="space-y-2">
              <Label>Service Fee (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" step="0.01" min="0" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} className="pl-8" />
              </div>
              <p className="text-xs text-slate-400">Added once to the total order amount</p>
            </div>
            <div className="space-y-2">
              <Label>Minimum Deposit (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" step="1" min="1" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="pl-8" />
              </div>
              <p className="text-xs text-slate-400">Minimum wallet deposit amount</p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-1">
            <p className="text-sm text-slate-600">
              <strong>Example:</strong> 5 reviews = <strong>${(base * 5).toFixed(2)}</strong> base ({basePrice} × 5) + <strong>${fee.toFixed(2)}</strong> fee = <strong>${(base * 5 + fee).toFixed(2)}</strong> total
            </p>
          </div>
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Pricing'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
