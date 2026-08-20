'use client';

import { useEffect, useState } from 'react';
import { fetchCollection, addDocument, updateDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, XCircle, PlayCircle, MapPin, Shield } from 'lucide-react';

const SERVICES = [
  { id: 'removal', name: 'Review Removal', icon: XCircle, color: 'from-red-500 to-rose-500' },
  { id: 'play_store', name: 'Google Play Store', icon: PlayCircle, color: 'from-emerald-500 to-green-500' },
  { id: 'maps', name: 'Google Maps', icon: MapPin, color: 'from-blue-500 to-sky-500' },
  { id: 'trustpilot', name: 'Trustpilot', icon: Shield, color: 'from-teal-500 to-cyan-500' },
];

export default function AdminPricingPage() {
  const [pricingId, setPricingId] = useState<string | null>(null);
  const [minDeposit, setMinDeposit] = useState('20');
  const [saving, setSaving] = useState(false);

  const [prices, setPrices] = useState<Record<string, { base: string; fee: string }>>({
    removal: { base: '1.00', fee: '0.15' },
    play_store: { base: '1.00', fee: '0.15' },
    maps: { base: '1.00', fee: '0.15' },
    trustpilot: { base: '1.00', fee: '0.15' },
  });

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await fetchCollection('pricing_settings');
        if (data && data.length > 0) {
          const row = data[0];
          setPricingId(row.id);
          setMinDeposit(String(row.min_deposit ?? 20));
          setPrices({
            removal: {
              base: String(row.removal_base_price ?? row.base_price ?? 1),
              fee: String(row.removal_service_fee ?? row.service_fee ?? 0.15),
            },
            play_store: {
              base: String(row.play_store_base_price ?? row.base_price ?? 1),
              fee: String(row.play_store_service_fee ?? row.service_fee ?? 0.15),
            },
            maps: {
              base: String(row.maps_base_price ?? row.base_price ?? 1),
              fee: String(row.maps_service_fee ?? row.service_fee ?? 0.15),
            },
            trustpilot: {
              base: String(row.trustpilot_base_price ?? row.base_price ?? 1),
              fee: String(row.trustpilot_service_fee ?? row.service_fee ?? 0.15),
            },
          });
        }
      } catch {}
    };
    fetchPricing();
  }, []);

  const updatePrice = (serviceId: string, field: 'base' | 'fee', value: string) => {
    setPrices((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], [field]: value },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        min_deposit: parseFloat(minDeposit) || 20,
        removal_base_price: parseFloat(prices.removal.base) || 1,
        removal_service_fee: parseFloat(prices.removal.fee) || 0,
        play_store_base_price: parseFloat(prices.play_store.base) || 1,
        play_store_service_fee: parseFloat(prices.play_store.fee) || 0,
        maps_base_price: parseFloat(prices.maps.base) || 1,
        maps_service_fee: parseFloat(prices.maps.fee) || 0,
        trustpilot_base_price: parseFloat(prices.trustpilot.base) || 1,
        trustpilot_service_fee: parseFloat(prices.trustpilot.fee) || 0,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pricing Settings</h1>
        <p className="text-sm text-slate-500">Configure pricing for each service individually.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          const base = parseFloat(prices[service.id].base) || 0;
          const fee = parseFloat(prices[service.id].fee) || 0;
          return (
            <Card key={service.id} className="shadow-card overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${service.color}`} />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${service.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  {service.name}
                </CardTitle>
                <CardDescription>Set base price per item and service fee.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Base Price per Item (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={prices[service.id].base}
                        onChange={(e) => updatePrice(service.id, 'base', e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Fee (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={prices[service.id].fee}
                        onChange={(e) => updatePrice(service.id, 'fee', e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-600">
                    <strong>Example:</strong> 5 items = <strong>${(base * 5).toFixed(2)}</strong> base + <strong>${fee.toFixed(2)}</strong> fee = <strong>${(base * 5 + fee).toFixed(2)}</strong> total
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2 max-w-xs">
            <Label>Minimum Deposit (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input type="number" step="1" min="1" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="pl-8" />
            </div>
            <p className="text-xs text-slate-400">Minimum wallet deposit amount</p>
          </div>
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Pricing'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
