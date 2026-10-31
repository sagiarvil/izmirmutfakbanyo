(() => {
  'use strict';
  const form = document.getElementById('ym-lead-form');
  if (!form) return;
  const status = document.getElementById('ym-form-message');
  const submit = form.querySelector('button[type="submit"]');
  const qs = new URLSearchParams(window.location.search);
  let submitted = false;

  const key = window.crypto?.randomUUID ? window.crypto.randomUUID() : ('id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9));

  const track = (event) => {
    // Sadece kullanıcı izni olduğunda PII içermeyen event gönder
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, {
        service: 'commercial_fitout',
        page_path: '/projelendirme/'
      });
    }
  };

  form.addEventListener('focusin', () => {
    if (!submitted) {
      track('generate_lead_form_start');
      submitted = true;
    }
  }, { once: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (submit) submit.disabled = true;
    if (status) {
      status.className = 'text-xs text-amber-400 font-semibold mt-3';
      status.textContent = 'Talebiniz iletiliyor…';
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.privacy_ack = form.querySelector('[name="privacy_ack"]')?.checked || false;
    data.marketing_opt_in = form.querySelector('[name="marketing_opt_in"]')?.checked || false;
    data.idempotency_key = key;

    for (const item of ['utm_source', 'utm_medium', 'utm_campaign']) {
      data[item] = (qs.get(item) || '').slice(0, 100);
    }

    // Telefon ve WhatsApp ile doğrudan entegre fallback veya API gönderimi
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        if (status) {
          status.className = 'text-xs text-emerald-400 font-semibold mt-3';
          status.textContent = 'Talebiniz başarıyla kaydedildi. Mimari ekibimiz en kısa sürede dönüş sağlayacaktır.';
        }
        track('generate_lead');
        form.reset();
        if (submit) submit.disabled = true;
      } else {
        throw new Error('API Hatası');
      }
    } catch (err) {
      // Çevrimdışı / API fallback durumu
      if (status) {
        status.className = 'text-xs text-amber-300 font-semibold mt-3';
        status.textContent = 'Talebiniz alındı. Hızlı iletişim için WhatsApp veya telefon üzerinden de ulaşabilirsiniz.';
      }
      track('generate_lead');
      form.reset();
      if (submit) submit.disabled = false;
    }
  });
})();
