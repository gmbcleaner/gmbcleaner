'use client';

import { useState, useEffect } from 'react';
import { updateDocument } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile, updatePassword } = useAuth();
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDocument('profiles', user.uid, {
        full_name: fullName || null,
        company: company || null,
      });
      await refreshProfile();
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return;
    setSaving(true);
    try {
      await updatePassword(newPassword);
      toast({ title: 'Password updated', description: 'Your password has been changed.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || '');
    setCompany(profile.company || '');
  }, [profile]);

  const displayEmail = profile?.email || user?.email || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={displayEmail || 'Not provided'} disabled />
            </div>
            <div className="space-y-2">
              <Label>User Code</Label>
              <Input value={profile?.user_code || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <Button onClick={handleProfileUpdate} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Lock className="h-5 w-5" />Security</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button onClick={handlePasswordChange} disabled={!newPassword || saving} variant="outline">
              <Shield className="mr-2 h-4 w-4" />Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
