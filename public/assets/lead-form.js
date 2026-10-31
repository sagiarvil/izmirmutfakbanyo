(() => {
  'use strict';
  const form = document.getElementById('ym-lead-form');
  if (!form) return;
  const status = document.getElementById('ym-form-message');
  const submit = form.querySelector('button[type="submit"]');
  const qs = new URLSearchParams(window.location.search);
  let submitted = false;
  const key = window.crypto?.randomUUID?.();
  if (!key) { status.textContent = 'Güvenli bağlantı kullanılmalı. Telefon ile iletişime geçebilirsiniz.'; submit.disabled = true; return; }
  const track = (event) => {
    // Only after user's analytics consent. Never send name, phone, email, notes or other PII to GA4.
    if (window.__analyticsConsentGranted === true && typeof window.gtag === 'function') {
      window.gtag('event', event, {service: 'commercial_fitout', page_path: '/projelendirme/'});
    }
  };
  form.addEventListener('focusin', () => { if (!submitted) {track('generate_lead_form_start'); submitted = true;} }, {once:true});
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const token = form.querySelector('[name="cf-turnstile-response"]')?.value || '';
    if (!token) {status.textContent = 'Güvenlik kontrolü tamamlanmadı. Alternatif iletişim bağlantısını kullanabilirsiniz.';return;}
    submit.disabled = true;
    status.textContent = 'Talep gönderiliyor…';
    const data = Object.fromEntries(new FormData(form).entries());
    data.privacy_ack = form.querySelector('[name="privacy_ack"]').checked;
    data.marketing_opt_in = form.querySelector('[name="marketing_opt_in"]').checked;
    data.idempotency_key = key;
    data.turnstile_token = token;
    for (const item of ['utm_source','utm_medium','utm_campaign']) data[item] = (qs.get(item)||'').slice(0,100);
    try {
      const response = await fetch(form.action, {method:'POST', credentials:'same-origin',
        headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result = await response.json();
      if ((response.status === 201 || response.status === 200) && result.accepted) {
        status.textContent = 'Talebiniz kaydedildi. Ekibimizin dönüş yapabilmesi için verdiğiniz numarayı kontrol edin.';
        track('generate_lead');
        form.reset();
        submit.disabled = true;
      } else {
        status.textContent = response.status===429 ? 'Kısa sürede çok sayıda talep alındı. Lütfen telefonla iletişime geçin.' : 'Talep kaydedilemedi. Bilgileri kontrol edin veya telefon/WhatsApp kullanın.';
        submit.disabled = false;
        window.turnstile?.reset?.();
      }
    } catch {
      status.textContent = 'Bağlantı kurulamadı. Telefon/WhatsApp ile iletişime geçebilirsiniz.';
      submit.disabled = false;
      window.turnstile?.reset?.();
    }
  });
})();
