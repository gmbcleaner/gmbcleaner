'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCollection, updateDocument, addDocument, deleteDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Ban,
  CheckCircle2,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { formatBDTime, isTodayInBD } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  phone?: string;
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

  const [balanceDialog, setBalanceDialog] = useState<UserProfile | null>(null);
  const [newBalance, setNewBalance] = useState('');

  const [profileDialog, setProfileDialog] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ full_name: '', company: '', role: 'user' });

  const [blockDialog, setBlockDialog] = useState<UserProfile | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<UserProfile | null>(null);
  const [detailDialog, setDetailDialog] = useState<UserProfile | null>(null);

  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await fetchCollection('profiles', undefined, 'created_at');
      setUsers((data as UserProfile[]) || []);
    } catch (err) {
      console.error('[Admin] Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_code?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCount = users.length;
  const blockedCount = users.filter((u) => u.is_blocked).length;
  const totalBalance = users.reduce((sum, u) => sum + (u.wallet_balance || 0), 0);

  const openBalanceDialog = (user: UserProfile) => {
    setBalanceDialog(user);
    setNewBalance(String(user.wallet_balance || 0));
  };

  const saveBalance = async () => {
    if (!balanceDialog) return;
    setSaving(true);
    try {
      const balance = parseFloat(newBalance) || 0;
      const diff = balance - (balanceDialog.wallet_balance || 0);
      await updateDocument('profiles', balanceDialog.id, { wallet_balance: balance });
      await addDocument('transactions', {
        user_id: balanceDialog.id,
        type: 'admin_adjustment',
        amount: diff,
        balance_after: balance,
        description: 'Admin balance adjustment',
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === balanceDialog.id ? { ...u, wallet_balance: balance } : u
        )
      );
      toast({ title: 'Balance updated', description: `New balance: $${balance.toFixed(2)}` });
      setBalanceDialog(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openProfileDialog = (user: UserProfile) => {
    setProfileDialog(user);
    setProfileForm({
      full_name: user.full_name || '',
      company: user.company || '',
      role: user.role || 'user',
    });
  };

  const saveProfile = async () => {
    if (!profileDialog) return;
    setSaving(true);
    try {
      await updateDocument('profiles', profileDialog.id, {
        full_name: profileForm.full_name,
        company: profileForm.company,
        role: profileForm.role,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === profileDialog.id
            ? { ...u, full_name: profileForm.full_name, company: profileForm.company, role: profileForm.role }
            : u
        )
      );
      toast({ title: 'Profile updated' });
      setProfileDialog(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = async (user: UserProfile) => {
    const newBlocked = !user.is_blocked;
    try {
      await updateDocument('profiles', user.id, { is_blocked: newBlocked });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_blocked: newBlocked } : u
        )
      );
      toast({ title: newBlocked ? 'User blocked' : 'User unblocked' });
      setBlockDialog(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const deleteUser = async (user: UserProfile) => {
    try {
      await deleteDocument('profiles', user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast({ title: 'User deleted', description: 'Moved to trash' });
      setDeleteDialog(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const UserAvatarLetter = (user: UserProfile | null) =>
    (user?.full_name || user?.email || 'U')?.charAt(0).toUpperCase() || 'U';

  const roleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700 text-[10px] font-semibold">Admin</Badge>;
      case 'provider':
        return <Badge className="bg-blue-100 text-blue-700 text-[10px] font-semibold">Provider</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700 text-[10px] font-semibold">User</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Manage all registered users and their accounts.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Users</p>
              <p className="text-xl font-bold text-slate-900">{totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <Ban className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Blocked</p>
              <p className="text-xl font-bold text-red-600">{blockedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Balance</p>
              <p className="text-xl font-bold text-slate-900">${totalBalance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
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
                <div
                  key={user.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    user.is_blocked
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shrink-0">
                      {UserAvatarLetter(user)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.full_name || user.email}
                        </p>
                        {user.is_blocked && (
                          <Badge className="bg-red-100 text-red-700 text-[10px]">Blocked</Badge>
                        )}
                        {roleBadge(user.role)}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email} {user.user_code && `\u00b7 ${user.user_code}`}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <CalendarDays className="h-3 w-3" />
                        {user.created_at
                          ? formatBDTime(user.created_at)
                          : 'No signup time'}
                        {isTodayInBD(user.created_at) && (
                          <Badge className="bg-cyan-100 text-cyan-700 text-[10px] font-semibold">Today</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <div className="text-right mr-2">
                      <p className="text-xs text-slate-400">Balance</p>
                      <p className="text-sm font-bold text-slate-900">
                        ${(user.wallet_balance || 0).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-500 hover:text-slate-700"
                      title="View details"
                      onClick={() => setDetailDialog(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-500 hover:text-teal-600"
                      title="Edit balance"
                      onClick={() => openBalanceDialog(user)}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-500 hover:text-sky-600"
                      title="Edit profile"
                      onClick={() => openProfileDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 ${
                        user.is_blocked
                          ? 'text-green-500 hover:text-green-700'
                          : 'text-red-500 hover:text-red-700'
                      }`}
                      title={user.is_blocked ? 'Unblock user' : 'Block user'}
                      onClick={() => setBlockDialog(user)}
                    >
                      {user.is_blocked ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:text-red-600"
                      title="Delete user"
                      onClick={() => setDeleteDialog(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
                  {UserAvatarLetter(detailDialog)}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {detailDialog.full_name || 'No name'}
                  </p>
                  <p className="text-sm text-slate-500">{detailDialog.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">User Code</p>
                  <p className="text-sm font-medium text-slate-700">{detailDialog.user_code || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700">{detailDialog.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Role</p>
                  <div>{roleBadge(detailDialog.role)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Company</p>
                  <p className="text-sm font-medium text-slate-700">{detailDialog.company || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Wallet Balance</p>
                  <p className="text-sm font-bold text-slate-900">
                    ${(detailDialog.wallet_balance || 0).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Status</p>
                  <div>
                    {detailDialog.is_blocked ? (
                      <Badge className="bg-red-100 text-red-700">Blocked</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Created At (BD Time)</p>
                  <p className="text-sm font-medium text-slate-700">
                    {detailDialog.created_at
                      ? formatBDTime(detailDialog.created_at)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Balance Dialog */}
      <Dialog open={!!balanceDialog} onOpenChange={() => setBalanceDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Balance</DialogTitle>
            <DialogDescription>
              Adjust wallet balance for {balanceDialog?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Wallet Balance (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-slate-400">
                Current: ${(balanceDialog?.wallet_balance || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialog(null)}>Cancel</Button>
            <Button onClick={saveBalance} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!profileDialog} onOpenChange={() => setProfileDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update profile information for {profileDialog?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={profileForm.company}
                onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={profileForm.role}
                onValueChange={(val) => setProfileForm((p) => ({ ...p, role: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialog(null)}>Cancel</Button>
            <Button onClick={saveProfile} disabled={saving} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={!!blockDialog} onOpenChange={() => setBlockDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{blockDialog?.is_blocked ? 'Unblock User' : 'Block User'}</DialogTitle>
            <DialogDescription>
              {blockDialog?.is_blocked
                ? `Are you sure you want to unblock ${blockDialog?.email}? They will regain access to the platform.`
                : `Are you sure you want to block ${blockDialog?.email}? They will lose access to the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialog(null)}>Cancel</Button>
            <Button
              onClick={() => blockDialog && toggleBlock(blockDialog)}
              className={blockDialog?.is_blocked
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'}
            >
              {blockDialog?.is_blocked ? 'Unblock' : 'Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog?.email}? This will soft-delete the user and move them to trash.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button
              onClick={() => deleteDialog && deleteUser(deleteDialog)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
