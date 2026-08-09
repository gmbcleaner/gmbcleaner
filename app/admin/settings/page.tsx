'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Save, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateDocument, fetchCollection } from '@/lib/db';

export default function AdminSettingsPage() {
  const [adminTelegramId, setAdminTelegramId] = useState('');
  const [providerTelegramId, setProviderTelegramId] = useState('');
  const [settingsId, setSettingsId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCollection('admin_settings')
      .then((data) => {
        if (data && data.length > 0) {
          const s = data[0];
          setSettingsId(s.id);
          setAdminTelegramId(s.admin_telegram_id || '');
          setProviderTelegramId(s.provider_telegram_id || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settingsId) {
        await updateDocument('admin_settings', settingsId, {
          admin_telegram_id: adminTelegramId.trim(),
          provider_telegram_id: providerTelegramId.trim(),
        });
      } else {
        const { addDocument } = await import('@/lib/db');
        const id = await addDocument('admin_settings', {
          admin_telegram_id: adminTelegramId.trim(),
          provider_telegram_id: providerTelegramId.trim(),
        });
        setSettingsId(id);
      }
      toast({ title: 'Settings saved', description: 'Telegram IDs updated successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Configure admin settings and notifications.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Admin Account</CardTitle>
          <CardDescription>Your administrator account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <ShieldCheck className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Main Administrator</p>
              <p className="text-xs text-slate-500">Full access to all platform features</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
              <Bell className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Telegram Notifications</CardTitle>
              <CardDescription>Set chat IDs for receiving bot notifications.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Admin Telegram Chat ID</Label>
            <Input
              placeholder="e.g. 7259050773"
              value={adminTelegramId}
              onChange={(e) => setAdminTelegramId(e.target.value)}
            />
            <p className="text-xs text-slate-400">Main admin receives all order and deposit notifications.</p>
          </div>
          <div className="space-y-2">
            <Label>Provider Admin Telegram Chat ID</Label>
            <Input
              placeholder="e.g. 7259050773"
              value={providerTelegramId}
              onChange={(e) => setProviderTelegramId(e.target.value)}
            />
            <p className="text-xs text-slate-400">Provider admin receives order assignment and task notifications.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
