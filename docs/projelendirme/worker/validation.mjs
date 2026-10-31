export const SECTORS = new Set([
  'magaza', 'ofis', 'kafe_restoran', 'klinik', 'otel', 'kuyumcu',
  'optik', 'zincir', 'diger'
]);
export const TIMELINES = new Set(['hemen', '1-3-ay', '3-6-ay', 'arastirma']);
const controlChars = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function plainText(value, limit = 600) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFC').trim().replace(/\s+/g, ' ').slice(0, limit);
}
export function normalizePhone(input) {
  const raw = plainText(input, 32);
  const digits = raw.replace(/\D/g, '');
  let national = digits;
  if (national.startsWith('90') && national.length === 12) national = national.slice(2);
  if (national.startsWith('0') && national.length === 11) national = national.slice(1);
  if (!/^[2-5]\d{9}$/.test(national)) return null;
  return '+90' + national;
}
export function validateLead(raw) {
  if (!raw || Array.isArray(raw) || typeof raw !== 'object') return { ok: false, error: 'invalid_payload' };
  const name = plainText(raw.name, 90);
  const company = plainText(raw.company, 120);
  const phone = normalizePhone(raw.phone);
  const email = plainText(raw.email, 140).toLowerCase();
  const sector = plainText(raw.sector, 32);
  const district = plainText(raw.district, 80);
  const timeline = plainText(raw.timeline, 24);
  const areaText = plainText(raw.area_m2, 12);
  const description = plainText(raw.description, 1200);
  const idempotencyKey = plainText(raw.idempotency_key, 40);
  const utmSource = plainText(raw.utm_source, 100);
  const utmMedium = plainText(raw.utm_medium, 100);
  const utmCampaign = plainText(raw.utm_campaign, 100);
  const companyRole = plainText(raw.role, 60);
  const budgetBand = plainText(raw.budget_band, 40);
  const emailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const area = areaText === '' ? null : Number(areaText.replace(',', '.'));
  if (name.length < 2 || !phone || !SECTORS.has(sector) || district.length < 2 || !TIMELINES.has(timeline)) {
    return { ok: false, error: 'required_fields_invalid' };
  }
  if (!emailValid || (area !== null && (!Number.isFinite(area) || area <= 0 || area > 1000000))) return { ok: false, error: 'field_invalid' };
  if (!/^[a-f0-9-]{36}$/i.test(idempotencyKey)) return { ok: false, error: 'invalid_idempotency_key' };
  if ([name, company, district, description, companyRole].some(x => controlChars.test(x))) return { ok: false, error: 'invalid_characters' };
  if (raw.privacy_ack !== true) return { ok: false, error: 'privacy_ack_required' };
  return { ok: true, data: {
    name, company, phone, email, sector, district, timeline, area,
    description, role: companyRole, budget_band: budgetBand,
    idempotency_key: idempotencyKey, marketing_opt_in: raw.marketing_opt_in === true ? 1 : 0,
    utm_source: utmSource, utm_medium: utmMedium, utm_campaign: utmCampaign
  }};
}
