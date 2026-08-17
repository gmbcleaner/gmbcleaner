const BD_COUNTRY_CODE = '880';

const PHONE_DOMAIN = 'phone.gmbcleaner.online';

export function normalizePhoneToE164(input: string): string | null {
  const cleaned = String(input || '').replace(/\D/g, '');
  if (!cleaned) return null;
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '+' + BD_COUNTRY_CODE + cleaned;
  }
  if (cleaned.length === 13 && cleaned.startsWith(BD_COUNTRY_CODE)) {
    return '+' + cleaned;
  }
  return null;
}

export function isPhoneInput(input: string): boolean {
  const trimmed = String(input || '').trim();
  if (!trimmed) return false;
  return !/@/.test(trimmed);
}

export function phoneToAccountEmail(phoneE164: string): string {
  const digits = String(phoneE164).replace(/\D/g, '');
  return `${digits}@${PHONE_DOMAIN}`;
}

export function resolveLoginEmail(input: string): string {
  if (isPhoneInput(input)) {
    const phone = normalizePhoneToE164(input);
    if (phone) return phoneToAccountEmail(phone);
  }
  return String(input || '').trim();
}