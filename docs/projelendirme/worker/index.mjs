import {validateLead} from './validation.mjs';

const json = (object, status = 200) => new Response(JSON.stringify(object), {
  status,
  headers: {'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'}
});

async function ipDigest(ip, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(ip));
  return Array.from(new Uint8Array(signature)).map(x => x.toString(16).padStart(2, '0')).join('');
}
async function turnstileVerify(token, env, ip) {
  const body = new URLSearchParams({secret: env.TURNSTILE_SECRET, response: token});
  if (ip) body.set('remoteip', ip);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body, signal: controller.signal,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && result.hostname === new URL(env.PUBLIC_ORIGIN).hostname && result.action === 'projelendirme_lead';
  } catch {return false;} finally {clearTimeout(timeout);}
}
async function readJSONBounded(request, maxBytes=16384) {
  const reader=request.body?.getReader();
  if (!reader) return {error:'invalid_json'};
  const chunks=[]; let total=0;
  try {
    while (true) {
      const {done,value}=await reader.read();
      if (done) break;
      total+=value.byteLength;
      if(total>maxBytes) {await reader.cancel();return {error:'payload_too_large'};}
      chunks.push(value);
    }
    const bytes=new Uint8Array(total); let pos=0;
    for(const chunk of chunks) {bytes.set(chunk,pos);pos+=chunk.length;}
    const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    return {value:JSON.parse(text)};
  } catch {return {error:'invalid_json'};}
}
function safeError(e) { return e instanceof Error ? e.message.slice(0,120) : 'unknown'; }
async function webhookPayload(env, lead) {
  const {id, created_at, name, company, phone, email, sector, district, timeline, area_m2, description, role, budget_band, utm_source, utm_medium, utm_campaign, marketing_opt_in} = lead;
  const body = JSON.stringify({event: 'new_projelendirme_lead', id, created_at, name, company, phone, email, sector, district, timeline, area_m2, description, role, budget_band, utm_source, utm_medium, utm_campaign, marketing_opt_in});
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CRM_WEBHOOK_SECRET), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const hmac = Array.from(new Uint8Array(sig)).map(x => x.toString(16).padStart(2, '0')).join('');
  return {body, hmac};
}
async function deliverPending(env, limit = 20) {
  if (!env.CRM_WEBHOOK_URL || !env.CRM_WEBHOOK_SECRET) return;
  const {results} = await env.DB.prepare(`SELECT * FROM leads WHERE notification_status=0 AND notification_attempts<8 ORDER BY created_at ASC LIMIT ?`).bind(limit).all();
  for (const lead of results || []) {
    const {body, hmac} = await webhookPayload(env, lead);
    let ok = false;
    try {
      const resp = await fetch(env.CRM_WEBHOOK_URL, {method:'POST', body,
        headers:{'Content-Type':'application/json','X-Yesilay-Signature':hmac, 'X-Idempotency-Key':lead.id},
        signal: AbortSignal.timeout(6000)});
      ok = resp.ok;
    } catch { /* retry next cron run */ }
    await env.DB.prepare(`UPDATE leads SET notification_status=?, notification_attempts=notification_attempts+1 WHERE id=?`)
      .bind(ok ? 1 : 0, lead.id).run();
  }
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/lead-projelendirme') return json({error:'not_found'},404);
    if (request.method !== 'POST') return json({error:'method_not_allowed'},405);
    const origin = request.headers.get('Origin');
    if (origin !== env.PUBLIC_ORIGIN || url.origin !== env.PUBLIC_ORIGIN) return json({error:'forbidden_origin'},403);
    const contentType = request.headers.get('Content-Type') || '';
    if (!/^application\/json(?:;|$)/i.test(contentType)) return json({error:'unsupported_media_type'},415);
    if (Number(request.headers.get('Content-Length') || 0) > 16384) return json({error:'payload_too_large'},413);
    if (!env.DB || !env.TURNSTILE_SECRET || !env.IP_HMAC_SECRET || !env.PUBLIC_ORIGIN) return json({error:'service_unavailable'},503);
    const parsed = await readJSONBounded(request);
    if (parsed.error) return json({error:parsed.error}, parsed.error==='payload_too_large'?413:400);
    const body = parsed.value;
    // Honeypot bot response: do not persist or notify.
    if (body && typeof body === 'object' && body.website) return json({accepted:true},202);
    const valid = validateLead(body);
    if (!valid.ok) return json({error: valid.error},400);
    const token = typeof body.turnstile_token === 'string' ? body.turnstile_token.slice(0,2048) : '';
    if (!token) return json({error:'captcha_required'},400);
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ipHash = await ipDigest(ip || 'unknown',env.IP_HMAC_SECRET);
    const since = Date.now() - 86400000;
    // Only in correctly authenticated requests should dedup bypass CAPTCHA; here CAPTCHA is always checked.
    if (!await turnstileVerify(token,env,ip)) return json({error:'captcha_failed'},403);
    try {
      const existing = await env.DB.prepare('SELECT id FROM leads WHERE idempotency_key=?').bind(valid.data.idempotency_key).first();
      if (existing) return json({accepted:true, duplicate:true},200);
      const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM leads WHERE ip_hash=? AND created_at>=?').bind(ipHash,since).first();
      if (Number(recent?.n || 0) >= 10) return json({error:'rate_limited'},429);
      const x = valid.data;
      const id = crypto.randomUUID();
      await env.DB.prepare(`INSERT INTO leads (
        id,idempotency_key,created_at,ip_hash,name,company,phone,email,sector,district,timeline,area_m2,
        description,role,budget_band,utm_source,utm_medium,utm_campaign,marketing_opt_in,privacy_ack
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        id,x.idempotency_key,Date.now(),ipHash,x.name,x.company,x.phone,x.email,x.sector,x.district,x.timeline,x.area,
        x.description,x.role,x.budget_band,x.utm_source,x.utm_medium,x.utm_campaign,x.marketing_opt_in,1
      ).run();
      // Lead is durably stored before any webhook attempt; retries done by scheduled handler.
      if (ctx?.waitUntil) ctx.waitUntil(deliverPending(env,3).catch(() => {}));
      return json({accepted:true},201);
    } catch (e) {
      // UNIQUE race on idempotency key: query and respond consistently.
      const existing = await env.DB.prepare('SELECT id FROM leads WHERE idempotency_key=?').bind(valid.data.idempotency_key).first().catch(()=>null);
      if (existing) return json({accepted:true,duplicate:true},200);
      // No sensitive data or raw errors to caller.
      console.error('lead_db_error', safeError(e));
      return json({error:'temporarily_unavailable'},503);
    }
  },
  async scheduled(_event,env,ctx) {
    ctx.waitUntil((async () => {
      await deliverPending(env,20);
      // Disabled until approved by KVKK/data controller. Then set RETENTION_DAYS explicitly.
      const days = Number(env.RETENTION_DAYS || 0);
      if (Number.isInteger(days) && days >= 30 && days <= 3650) {
        await env.DB.prepare('DELETE FROM leads WHERE created_at < ?').bind(Date.now()-days*86400000).run();
      }
    })());
  }
};
