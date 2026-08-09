import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = '8827977483:AAGmQqiCv_hKtv3SaiQwDwLWcb80GASgWyU';
const TELEGRAM_CHAT_ID = '7259050773';

async function sendMessage(text: string) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
  return res.ok;
}

async function sendPhoto(photo: string, caption: string) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, photo, caption, parse_mode: 'HTML' }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, text, photo, caption } = body;

    let ok = false;
    if (type === 'photo' && photo) {
      ok = await sendPhoto(photo, caption || text || '');
    } else if (text) {
      ok = await sendMessage(text);
    }

    return NextResponse.json({ ok });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
