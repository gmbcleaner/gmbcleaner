'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your admin account.</p>
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
    </div>
  );
}
