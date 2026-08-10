'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Users,
  ListOrdered,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserPlus,
  Settings,
  Wallet,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { fetchCollection, updateDocument } from '@/lib/db';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingDeposits: number;
  activeOrders: number;
}

interface RecentOrder {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  created_at: string;
  user_email?: string;
  items?: any[];
}

interface RecentDeposit {
  id: string;
  user_id: string;
  user_email?: string;
  amount: number;
  status: string;
  proof_url?: string;
  created_at: string;
}

interface RecentUser {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  role?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingDeposits: 0,
    activeOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentDeposits, setRecentDeposits] = useState<RecentDeposit[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [
        allUsers,
        allOrders,
        allDeposits,
        pendingDeposits,
        activeOrders,
        recentOrdersData,
        recentDepositsData,
        recentUsersData,
      ] = await Promise.all([
        fetchCollection('profiles').catch(() => []),
        fetchCollection('orders').catch(() => []),
        fetchCollection('deposits').catch(() => []),
        fetchCollection('deposits', [{ field: 'status', op: '==', value: 'pending' }]).catch(() => []),
        fetchCollection('orders', [{ field: 'status', op: '==', value: 'pending' }]).catch(() => []),
        fetchCollection('orders', undefined, 'created_at', 5).catch(() => []),
        fetchCollection('deposits', [{ field: 'status', op: '==', value: 'pending' }], 'created_at', 5).catch(() => []),
        fetchCollection('profiles', undefined, 'created_at', 5).catch(() => []),
      ]);

      const approvedDeposits = (allDeposits || []).filter(
        (d: any) => d.status === 'approved' || d.status === 'paid'
      );
      const totalRevenue = approvedDeposits.reduce(
        (sum: number, d: any) => sum + (d.amount || 0),
        0
      );

      setStats({
        totalUsers: (allUsers || []).length,
        totalOrders: (allOrders || []).length,
        totalRevenue,
        pendingDeposits: (pendingDeposits || []).length,
        activeOrders: (activeOrders || []).length,
      });

      setRecentOrders((recentOrdersData as RecentOrder[]) || []);
      setRecentDeposits((recentDepositsData as RecentDeposit[]) || []);
      setRecentUsers((recentUsersData as RecentUser[]) || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApproveDeposit = async (depositId: string) => {
    try {
      await updateDocument('deposits', depositId, { status: 'approved' });
      setRecentDeposits((prev) => prev.filter((d) => d.id !== depositId));
      setStats((prev) => ({
        ...prev,
        pendingDeposits: Math.max(0, prev.pendingDeposits - 1),
      }));
      fetchData();
    } catch (err) {
      console.error('Failed to approve deposit:', err);
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    try {
      await updateDocument('deposits', depositId, { status: 'rejected' });
      setRecentDeposits((prev) => prev.filter((d) => d.id !== depositId));
      setStats((prev) => ({
        ...prev,
        pendingDeposits: Math.max(0, prev.pendingDeposits - 1),
      }));
    } catch (err) {
      console.error('Failed to reject deposit:', err);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const statCards = [
    {
      title: 'Total Users',
      value: String(stats.totalUsers),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      description: 'Registered accounts',
    },
    {
      title: 'Total Orders',
      value: String(stats.totalOrders),
      icon: ListOrdered,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      description: 'All time orders',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      description: 'Approved deposits',
    },
    {
      title: 'Pending Deposits',
      value: String(stats.pendingDeposits),
      icon: Wallet,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      description: 'Awaiting review',
    },
    {
      title: 'Active Orders',
      value: String(stats.activeOrders),
      icon: Activity,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      description: 'In progress',
    },
  ];

  const quickActions = [
    { label: 'Users', href: '/admin/users', icon: Users, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
    { label: 'Orders', href: '/admin/orders', icon: ListOrdered, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
    { label: 'Deposits', href: '/admin/deposits', icon: Wallet, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, color: 'text-slate-600 bg-slate-50 hover:bg-slate-100' },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of your platform. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`shadow-sm border ${card.border} transition-shadow hover:shadow-md`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                    <p className="text-xs text-slate-400">{card.description}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm border border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Revenue Overview
          </CardTitle>
          <CardDescription>Total approved deposit revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900">
              ${stats.totalRevenue.toFixed(2)}
            </span>
            <span className="mb-1 text-sm text-slate-500">total lifetime revenue</span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min((stats.totalRevenue / Math.max(stats.totalRevenue, 1)) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border border-slate-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-violet-600" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Last 5 orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders" className="text-xs gap-1">
                  View All <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => toggleOrderExpand(order.id)}
                      className="flex w-full items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {order.order_code || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-slate-900">
                          ${(order.total_amount || 0).toFixed(2)}
                        </span>
                        <Badge className={`text-xs font-medium border ${statusColors[order.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {order.status || 'unknown'}
                        </Badge>
                        {expandedOrder === order.id ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                    {expandedOrder === order.id && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-2">
                        {order.user_email && (
                          <p className="text-xs text-slate-500">
                            <span className="font-medium">Customer:</span> {order.user_email}
                          </p>
                        )}
                        {order.items && order.items.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Items:</p>
                            {order.items.map((item: any, idx: number) => (
                              <p key={idx} className="text-xs text-slate-600">
                                {item.name || item.title || `Item ${idx + 1}`} × {item.quantity || 1} — ${(item.price || 0).toFixed(2)}
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-400">
                          ID: {order.id}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  Pending Deposits
                </CardTitle>
                <CardDescription>Awaiting approval</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/deposits" className="text-xs gap-1">
                  View All <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentDeposits.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No pending deposits.</p>
            ) : (
              <div className="space-y-2">
                {recentDeposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        ${(deposit.amount || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {deposit.user_email || deposit.user_id || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {deposit.created_at
                          ? new Date(deposit.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => handleApproveDeposit(deposit.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectDeposit(deposit.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border border-slate-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  Recent Users
                </CardTitle>
                <CardDescription>Last 5 registered users</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users" className="text-xs gap-1">
                  View All <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No users yet.</p>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 shrink-0">
                        <span className="text-sm font-semibold text-slate-600">
                          {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.full_name || 'No name'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {user.role && user.role !== 'user' && (
                        <Badge className="text-xs bg-slate-100 text-slate-700 border-slate-200 mb-1">
                          {user.role}
                        </Badge>
                      )}
                      <p className="text-xs text-slate-400">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-rose-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Navigate to admin sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    asChild
                    className={`h-auto flex-col gap-2 py-5 border-slate-100 ${action.color} transition-colors`}
                  >
                    <Link href={action.href}>
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-medium text-slate-600">System Status</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Last refresh</span>
                  <span className="text-slate-700 font-medium">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Auto-refresh</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active (30s)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Pending actions</span>
                  <span className={`font-medium ${stats.pendingDeposits > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {stats.pendingDeposits > 0 ? (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {stats.pendingDeposits} deposit{stats.pendingDeposits !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      'None'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
