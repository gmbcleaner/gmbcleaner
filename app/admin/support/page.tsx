'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchCollection, updateDocument, addSubcollectionDoc, fetchSubcollection } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, ArrowLeft, User, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Ticket {
  id: string;
  user_id: string;
  user_email?: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  ticket_messages?: { id: string; message: string; is_admin: boolean; user_id: string; created_at: string }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Open', color: 'bg-green-100 text-green-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-700', icon: XCircle },
};

const priorityConfig: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      const data = await fetchCollection('support_tickets', undefined, 'created_at');
      const withMessages = await Promise.all(
        (data || []).map(async (t) => {
          const msgs = await fetchSubcollection('support_tickets', t.id, 'ticket_messages', 'created_at');
          return { ...t, ticket_messages: msgs };
        })
      );
      setTickets(withMessages as Ticket[]);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.ticket_messages]);

  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      fetchSubcollection('support_tickets', selected.id, 'ticket_messages', 'created_at').then((msgs) => {
        setSelected((prev) => prev ? { ...prev, ticket_messages: msgs as any } : prev);
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await addSubcollectionDoc('support_tickets', selected.id, 'ticket_messages', {
        user_id: 'admin',
        message: reply.trim(),
        is_admin: true,
      });
      if (selected.status === 'open') {
        await updateDocument('support_tickets', selected.id, { status: 'in_progress' });
      }

      setReply('');
      fetchTickets();
      // Refresh selected ticket
      const msgs = await fetchSubcollection('support_tickets', selected.id, 'ticket_messages', 'created_at');
      setSelected((prev) => prev ? { ...prev, ticket_messages: msgs as any } : prev);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSending(false); }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    await updateDocument('support_tickets', ticketId, { status });
    fetchTickets();
    if (selected?.id === ticketId) setSelected((prev) => prev ? { ...prev, status } : prev);
    toast({ title: `Ticket ${status}` });
  };

  const unreadCount = tickets.filter(t => t.status === 'open').length;

  if (selected) {
    const msgs = selected.ticket_messages || [];
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">{selected.subject}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge>
              <Badge className={priorityConfig[selected.priority]}>{selected.priority}</Badge>
              <span className="text-xs text-slate-500">{selected.user_email || selected.user_id}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {selected.status !== 'open' && <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'open')}>Reopen</Button>}
            {selected.status !== 'closed' && <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'closed')}>Close</Button>}
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden shadow-card">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-3 ${msg.is_admin ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  <p className={`text-[10px] font-medium mb-1 ${msg.is_admin ? 'text-teal-100' : 'text-slate-500'}`}>
                    {msg.is_admin ? 'Admin' : 'User'} &middot; {new Date(msg.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </CardContent>
          {selected.status !== 'closed' && (
            <div className="border-t border-slate-200 p-3 flex gap-2">
              <Input placeholder="Type your reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} className="flex-1" />
              <Button onClick={sendReply} disabled={!reply.trim() || sending} className="bg-teal-500 hover:bg-teal-600 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Tickets</h1>
        <p className="text-sm text-slate-500">Manage user support requests. {unreadCount > 0 && <span className="text-green-600 font-medium">{unreadCount} open</span>}</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-center text-sm text-slate-500 py-12">Loading...</p>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center"><MessageSquare className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-3 text-sm text-slate-500">No support tickets yet.</p></div>
          ) : (
            <div className="space-y-2">
              {[...tickets].reverse().map((ticket) => {
                const lastMsg = ticket.ticket_messages?.[ticket.ticket_messages.length - 1];
                const isAdminLast = lastMsg?.is_admin;
                return (
                  <button key={ticket.id} onClick={() => setSelected(ticket)}
                    className={`w-full text-left rounded-lg border p-4 hover:bg-slate-50 transition-colors ${ticket.status === 'open' && !isAdminLast ? 'border-green-300 bg-green-50/50' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${ticket.status === 'open' ? 'bg-green-100' : 'bg-slate-100'}`}>
                          <User className={`h-4 w-4 ${ticket.status === 'open' ? 'text-green-600' : 'text-slate-500'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 truncate">{ticket.subject}</p>
                            {ticket.status === 'open' && !isAdminLast && <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{ticket.user_email || ticket.user_id} &middot; {new Date(ticket.created_at).toLocaleDateString()}</p>
                          {lastMsg && <p className="text-xs text-slate-400 truncate mt-0.5">{lastMsg.is_admin ? 'You: ' : ''}{lastMsg.message}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={priorityConfig[ticket.priority]}>{ticket.priority}</Badge>
                        <Badge className={statusConfig[ticket.status]?.color}>{statusConfig[ticket.status]?.label}</Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
