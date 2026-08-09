'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function ProviderSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your provider account.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Provider Account</CardTitle>
          <CardDescription>Your service provider account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Wrench className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Service Provider</p>
              <p className="text-xs text-slate-500">Access to order management and task tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
