'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  user_code: string;
  wallet_balance: number;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, role, user_code, wallet_balance, created_at')
          .order('created_at', { ascending: false });
        setUsers((data as UserProfile[]) || []);
      } catch {
        // Supabase unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_code?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    provider: 'bg-blue-100 text-blue-700',
    user: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">{users.length} total users</p>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by email or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No users found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-500 text-xs font-bold text-white">
                      {u.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{u.email}</p>
                      <p className="text-xs text-slate-500">Code: {u.user_code || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">${(u.wallet_balance ?? 0).toFixed(2)}</span>
                    <Badge className={roleColors[u.role] || 'bg-slate-100 text-slate-700'}>
                      {u.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
