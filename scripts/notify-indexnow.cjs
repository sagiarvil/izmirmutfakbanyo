'use strict';
/**
 * REAL-SEO-2026 — IndexNow Bildirim Betiği
 * dist/sitemap.xml içindeki gerçek kanonik URL'leri Bing / Yandex / IndexNow uç noktalarına bildirir.
 */
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const CONFIG = {
  host: 'yesilaymutfak.com',
  indexNowKey: '9d980417475ac56c8ad72ef2c743e1e5',
  endpoints: [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ]
};

function readCanonicalUrlsFromSitemap() {
  const sitemapPath = path.resolve(__dirname, '..', 'dist', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('dist/sitemap.xml bulunamadı. Önce npm run build çalıştırın.');
  }
  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  const urls = [];
  const urlBlockRegex = /<url>([\s\S]*?)<\/url>/g;
  let block;
  while ((block = urlBlockRegex.exec(xml)) !== null) {
    const cleanBlock = block[1].replace(/<image:image>[\s\S]*?<\/image:image>/g, '');
    const locMatch = cleanBlock.match(/<loc>([^<]+)<\/loc>/);
    if (locMatch) urls.push(locMatch[1].trim());
  }
  return urls;
}

async function notifyIndexNow(urls) {
  if (!urls || urls.length === 0) {
    console.log('⚠️ [IndexNow] Gönderilecek URL listesi boş.');
    return [];
  }

  const payload = JSON.stringify({
    host: CONFIG.host,
    key: CONFIG.indexNowKey,
    keyLocation: `https://${CONFIG.host}/${CONFIG.indexNowKey}.txt`,
    urlList: urls
  });

  const promises = CONFIG.endpoints.map(endpoint => {
    return new Promise(resolve => {
      const u = new URL(endpoint);
      const req = https.request(
        {
          hostname: u.hostname,
          path: u.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload)
          }
        },
        res => {
          console.log(`✅ [IndexNow: ${u.hostname}] HTTP ${res.statusCode} (${urls.length} URL)`);
          resolve({ host: u.hostname, status: res.statusCode });
        }
      );

      req.on('error', err => {
        console.error(`⚠️ [IndexNow: ${u.hostname}] Hata: ${err.message}`);
        resolve({ host: u.hostname, error: err.message });
      });

      req.write(payload);
      req.end();
    });
  });

  return Promise.all(promises);
}

if (require.main === module) {
  const urls = readCanonicalUrlsFromSitemap();
  notifyIndexNow(urls);
}

module.exports = { notifyIndexNow, readCanonicalUrlsFromSitemap };
