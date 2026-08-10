const TELEGRAM_BOT_TOKEN = '8827977483:AAGmQqiCv_hKtv3SaiQwDwLWcb80GASgWyU';
const DEFAULT_CHAT_ID = '7259050773';

let adminChatId = DEFAULT_CHAT_ID;
let providerAdminChatId = '';

export function setTelegramChatIds(adminId: string, providerId: string) {
  adminChatId = adminId || DEFAULT_CHAT_ID;
  providerAdminChatId = providerId || '';
}

export function getTelegramChatIds() {
  return { adminChatId, providerAdminChatId };
}

async function sendToChat(chatId: string, text: string): Promise<boolean> {
  if (!chatId) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function sendPhotoToChat(chatId: string, photoUrl: string, caption: string): Promise<boolean> {
  if (!chatId) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML' }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function canSendNotification(userId: string): boolean {
  try {
    const key = `tg_notif_${userId}`;
    const last = localStorage.getItem(key);
    if (!last) return true;
    const hoursSince = (Date.now() - parseInt(last)) / (1000 * 60 * 60);
    return hoursSince >= 24;
  } catch {
    return true;
  }
}

function markNotificationSent(userId: string) {
  try {
    localStorage.setItem(`tg_notif_${userId}`, String(Date.now()));
  } catch {}
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const r1 = await sendToChat(adminChatId, text);
  const r2 = providerAdminChatId ? await sendToChat(providerAdminChatId, text) : false;
  return r1 || r2;
}

export async function sendTelegramAdminOnly(text: string): Promise<boolean> {
  return sendToChat(adminChatId, text);
}

export async function sendTelegramSupportNotification(userId: string, text: string): Promise<boolean> {
  if (!canSendNotification(userId)) return false;
  markNotificationSent(userId);
  return sendToChat(adminChatId, text);
}
