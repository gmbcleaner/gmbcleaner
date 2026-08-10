'use client';

import { useEffect, useState } from 'react';
import { fetchCollection, addDocument, addSubcollectionDoc, fetchSubcollection } from '@/lib/db';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, Plus, Send, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendTelegramSupportNotification, setTelegramChatIds } from '@/lib/telegram';

interface Ticket { id: string; subject: string; status: string; priority: string; created_at: string; ticket_messages?: { id: string; message: string; is_admin: boolean; created_at: string }[]; }

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchTickets();
    fetchCollection('admin_settings').then((data) => {
      if (data && data.length > 0) {
        const s = data[0];
        setTelegramChatIds(s.admin_telegram_id || '', s.provider_telegram_id || '');
      }
    }).catch(() => {});
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const ticketsData = await fetchCollection('support_tickets', [{ field: 'user_id', op: '==', value: user.uid }], 'created_at');
      const ticketsWithMessages = await Promise.all(
        ticketsData.map(async (ticket) => {
          const messages = await fetchSubcollection('support_tickets', ticket.id, 'ticket_messages', 'created_at');
          return { ...ticket, ticket_messages: messages };
        })
      );
      setTickets(ticketsWithMessages as Ticket[]);
    } catch {}
  };

  const createTicket = async () => {
    if (!user || !subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const ticketId = await addDocument('support_tickets', { user_id: user.uid, user_email: user.email, subject: subject.trim(), status: 'open', priority });
      await addSubcollectionDoc('support_tickets', ticketId, 'ticket_messages', { user_id: user.uid, message: message.trim(), is_admin: false });
      await addDocument('notifications', {
        user_id: user.uid,
        title: 'Support Ticket Created',
        message: `Your ticket "${subject.trim()}" has been created. We'll respond shortly.`,
        type: 'support',
        is_read: false,
      });

      const telegramMsg = [
        '🎫 <b>New Support Ticket</b>',
        '',
        `👤 User: ${user.email}`,
        `📋 Subject: ${subject.trim()}`,
        `⚡ Priority: ${priority}`,
        '',
        `💬 Message:`,
        message.trim(),
      ].join('\n');
      sendTelegramSupportNotification(user.uid, telegramMsg).catch(() => {});

      toast({ title: 'Ticket created', description: 'We will respond shortly.' });
      setNewOpen(false); setSubject(''); setMessage(''); setPriority('medium');
      fetchTickets();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const sendReply = async () => {
    if (!user || !selectedTicket || !reply.trim()) return;
    setReplying(true);
    try {
      await addSubcollectionDoc('support_tickets', selectedTicket.id, 'ticket_messages', { user_id: user.uid, message: reply.trim(), is_admin: false });

      const telegramMsg = [
        '💬 <b>User Reply (Support)</b>',
        '',
        `👤 User: ${user.email}`,
        `📋 Ticket: ${selectedTicket.subject}`,
        '',
        reply.trim(),
      ].join('\n');
      sendTelegramSupportNotification(user.uid, telegramMsg).catch(() => {});

      setReply('');
      fetchTickets();
    } catch {} finally { setReplying(false); }
  };

  const statusColors: Record<string, string> = { open: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', closed: 'bg-slate-100 text-slate-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support</h1>
          <p className="text-sm text-slate-500">Create and manage support tickets.</p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-500 to-sky-500 text-white"><Plus className="mr-2 h-4 w-4" />New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Subject</Label><Input placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Describe your issue in detail..." rows={4} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button onClick={createTicket} disabled={!subject.trim() || !message.trim() || submitting}><Send className="mr-2 h-4 w-4" />Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {tickets.length === 0 ? (
            <div className="py-12 text-center"><LifeBuoy className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-3 text-sm text-slate-500">No support tickets yet.</p></div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <button key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="w-full text-left rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                      <div><p className="text-sm font-semibold text-slate-900">{ticket.subject}</p><p className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</p></div>
                    </div>
                    <Badge className={statusColors[ticket.status] || 'bg-slate-100 text-slate-700'}>{ticket.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedTicket?.subject}</DialogTitle></DialogHeader>
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {selectedTicket?.ticket_messages?.map((msg) => (
              <div key={msg.id} className={`rounded-lg p-3 ${msg.is_admin ? 'bg-slate-100' : 'bg-teal-50 border border-teal-200'}`}>
                <p className="text-[10px] font-medium text-slate-500 mb-1">{msg.is_admin ? 'Admin' : 'You'} &middot; {new Date(msg.created_at).toLocaleString()}</p>
                <p className="text-sm text-slate-700">{msg.message}</p>
              </div>
            ))}
          </div>
          {selectedTicket?.status !== 'closed' ? (
            <div className="flex gap-2">
              <Input placeholder="Type your reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
              <Button size="icon" onClick={sendReply} disabled={!reply.trim() || replying}><Send className="h-4 w-4" /></Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-2">This ticket is closed. <button className="text-teal-600 font-medium hover:underline" onClick={() => {}}>Create a new ticket</button> for further help.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
