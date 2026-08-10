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
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
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
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption,
          parse_mode: 'HTML',
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const r1 = await sendToChat(adminChatId, text);
  const r2 = providerAdminChatId ? await sendToChat(providerAdminChatId, text) : false;
  return r1 || r2;
}

export async function sendTelegramAdminOnly(text: string): Promise<boolean> {
  return sendToChat(adminChatId, text);
}

export async function sendTelegramPhoto(photoUrl: string, caption: string): Promise<boolean> {
  const r1 = await sendPhotoToChat(adminChatId, photoUrl, caption);
  const r2 = providerAdminChatId ? await sendPhotoToChat(providerAdminChatId, photoUrl, caption) : false;
  return r1 || r2;
}

export async function sendTelegramDocument(documentUrl: string, caption: string): Promise<boolean> {
  if (!adminChatId) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminChatId,
          document: documentUrl,
          caption,
          parse_mode: 'HTML',
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
