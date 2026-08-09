'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ClipboardList, ExternalLink } from 'lucide-react';

interface ProviderTask {
  id: string;
  order_id: string;
  order_item_id: string;
  status: string;
  review_url: string;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  orders?: { order_code: string } | null;
}

export default function ProviderTasksPage() {
  const [tasks, setTasks] = useState<ProviderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchTasks = async () => {
    try {
      const providerId = localStorage.getItem('gmb_provider_id');
      if (!providerId) return;

      const { data } = await supabase
        .from('provider_tasks')
        .select('*, orders(order_code)')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      setTasks((data as ProviderTask[]) || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const startTask = async (taskId: string) => {
    setUpdating(taskId);
    try {
      await supabase.from('provider_tasks').update({ status: 'processing' }).eq('id', taskId);
      toast({ title: 'Task started' });
      fetchTasks();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const completeTask = async (taskId: string) => {
    setUpdating(taskId);
    try {
      await supabase.from('provider_tasks').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes: notes[taskId] || null,
      }).eq('id', taskId);

      // Check if all tasks for the order are completed
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const { data: remaining } = await supabase
          .from('provider_tasks')
          .select('id')
          .eq('order_id', task.order_id)
          .neq('status', 'completed');

        if (!remaining || remaining.length === 0) {
          await supabase.from('orders').update({ status: 'completed' }).eq('id', task.order_id);
        }
      }

      toast({ title: 'Task completed' });
      fetchTasks();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const pending = tasks.filter(t => t.status === 'pending');
  const processing = tasks.filter(t => t.status === 'processing');
  const completed = tasks.filter(t => t.status === 'completed');

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
        <p className="text-sm text-slate-500">Manage your assigned review dispute tasks.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="processing">In Progress ({processing.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <TabsContent value="pending" className="space-y-3">
              {pending.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No pending tasks.</p>
              ) : pending.map((task) => (
                <Card key={task.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[task.status]}>{task.status}</Badge>
                          <span className="text-xs text-slate-500">{(task.orders as any)?.order_code}</span>
                        </div>
                        <a href={task.review_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline truncate">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{task.review_url}</span>
                        </a>
                        <p className="mt-1 text-xs text-slate-400">{new Date(task.created_at).toLocaleString()}</p>
                      </div>
                      <Button size="sm" className="shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white" onClick={() => startTask(task.id)} disabled={updating === task.id}>
                        {updating === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="processing" className="space-y-3">
              {processing.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No tasks in progress.</p>
              ) : processing.map((task) => (
                <Card key={task.id} className="shadow-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[task.status]}>{task.status}</Badge>
                          <span className="text-xs text-slate-500">{(task.orders as any)?.order_code}</span>
                        </div>
                        <a href={task.review_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline truncate">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{task.review_url}</span>
                        </a>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Notes (optional)</Label>
                      <Textarea rows={2} placeholder="Add notes about the dispute..." value={notes[task.id] || ''} onChange={(e) => setNotes({ ...notes, [task.id]: e.target.value })} />
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white" onClick={() => completeTask(task.id)} disabled={updating === task.id}>
                      {updating === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Done'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {completed.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No completed tasks yet.</p>
              ) : completed.map((task) => (
                <Card key={task.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[task.status]}>{task.status}</Badge>
                          <span className="text-xs text-slate-500">{(task.orders as any)?.order_code}</span>
                        </div>
                        <a href={task.review_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline truncate">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{task.review_url}</span>
                        </a>
                        {task.notes && <p className="mt-1 text-xs text-slate-500">Notes: {task.notes}</p>}
                        {task.completed_at && <p className="mt-1 text-xs text-slate-400">Completed: {new Date(task.completed_at).toLocaleString()}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
