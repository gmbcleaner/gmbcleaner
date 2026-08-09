'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCollection, updateDocument, addDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Search, DollarSign, Ban, CheckCircle2, Shield, Edit } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  wallet_balance: number;
  is_blocked?: boolean;
  user_code?: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await fetchCollection('profiles');
      setUsers((data as UserProfile[]) || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    try {
      await updateDocument('profiles', userId, { is_blocked: !currentlyBlocked });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: !currentlyBlocked } : u));
      toast({ title: currentlyBlocked ? 'User unblocked' : 'User blocked' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openEditBalance = (user: UserProfile) => {
    setEditUser(user);
    setEditBalance(String(user.wallet_balance || 0));
  };

  const saveBalance = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const newBalance = parseFloat(editBalance) || 0;
      await updateDocument('profiles', editUser.id, { wallet_balance: newBalance });
      await addDocument('transactions', {
        user_id: editUser.id,
        type: 'admin_adjustment',
        amount: newBalance - (editUser.wallet_balance || 0),
        balance_after: newBalance,
        description: `Admin balance adjustment`,
      });
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, wallet_balance: newBalance } : u));
      toast({ title: 'Balance updated', description: `New balance: $${newBalance.toFixed(2)}` });
      setEditUser(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.user_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Manage all registered users and their accounts.</p>
        </div>
        <Badge variant="outline" className="w-fit">{users.length} users</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by name, email, or user code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading users...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No users found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => (
                <div key={user.id} className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${user.is_blocked ? 'border-red-200 bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shrink-0">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || user.email}</p>
                        {user.is_blocked && <Badge className="bg-red-100 text-red-700 text-[10px]">Blocked</Badge>}
                        {user.role === 'admin' && <Badge className="bg-purple-100 text-purple-700 text-[10px]">Admin</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{user.email} {user.user_code && `· ${user.user_code}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div className="text-right mr-2">
                      <p className="text-xs text-slate-400">Balance</p>
                      <p className="text-sm font-bold text-slate-900">${(user.wallet_balance || 0).toFixed(2)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => openEditBalance(user)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Balance
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-7 text-xs ${user.is_blocked ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                      onClick={() => toggleBlock(user.id, !!user.is_blocked)}
                    >
                      {user.is_blocked ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" /> Unblock</>
                      ) : (
                        <><Ban className="mr-1 h-3 w-3" /> Block</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Balance — {editUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Wallet Balance (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-slate-400">Current: ${(editUser?.wallet_balance || 0).toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveBalance} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
