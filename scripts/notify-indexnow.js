#!/usr/bin/env node
/**
 * REAL-SEO-2026 — IndexNow Doğrudan Bildirim Betiği
 * Yalnızca gerçek, 200 OK dönen, index,follow kanonik URL'leri Bing / Yandex / IndexNow ağına bildirir.
 */

const HOST = 'izmirmutfakbanyo.com.tr';
const KEY = '4f3b13d08a58aa2a17eedb8945a29a16';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URL_LIST = [
  `https://${HOST}/`,
  `https://${HOST}/mutfak/`,
  `https://${HOST}/banyo/`,
  `https://${HOST}/cam-balkon/`,
  `https://${HOST}/ev-tadilati/`,
  `https://${HOST}/kahve-kosesi/`,
  `https://${HOST}/modeller/`,
  `https://${HOST}/projeler/`,
  `https://${HOST}/hakkimizda/`,
  `https://${HOST}/iletisim/`,
  `https://${HOST}/yayinlar/`
];

async function pushIndexNow() {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: URL_LIST
  };

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  const bodyText = await response.text();
  console.log(`[IndexNow] HTTP ${response.status} — ${URL_LIST.length} kanonik URL gönderildi.`);
  if (bodyText) {
    console.log(`[IndexNow] Yanıt: ${bodyText}`);
  }

  if (response.status !== 200 && response.status !== 202) {
    process.exitCode = 1;
  }
}

pushIndexNow().catch((err) => {
  console.error('[IndexNow] Hata:', err.message);
  process.exitCode = 1;
});
