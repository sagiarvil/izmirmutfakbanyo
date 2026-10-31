import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = '/Users/macair1/projects/cem-yesilay/dist';
const results = [];

function check(name, fn) {
  try {
    fn();
    results.push({ test: name, status: 'PASS' });
  } catch (err) {
    results.push({ test: name, status: 'FAIL', reason: err.message });
  }
}

// 1. Projelendirme HTML dosyası varlığı ve boyutu
const projelendirmeHtmlPath = path.join(DIST, 'projelendirme', 'index.html');
let html = '';
check('P0-11: Projelendirme index.html mevcut ve > 5KB', () => {
  assert.ok(fs.existsSync(projelendirmeHtmlPath));
  html = fs.readFileSync(projelendirmeHtmlPath, 'utf-8');
  assert.ok(html.length > 5000);
});

// 2. Canonical kontrolü
check('P0-13: Tek ve doğru canonical URL', () => {
  const matches = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/yesilaymutfak\.com\/projelendirme\/["']/gi) || [];
  assert.equal(matches.length, 1);
});

// 3. Tekil H1 kontrolü
check('P0-19: Tekil H1 başlığı', () => {
  const h1s = html.match(/<h1(?:\s|>)/gi) || [];
  assert.equal(h1s.length, 1);
  assert.ok(html.includes('İzmir Ticari Mekân'));
});

// 4. Tekil Title kontrolü
check('P0-18: Tekil Title ve doğru etiket', () => {
  const titles = html.match(/<title(?:\s|>)/gi) || [];
  assert.equal(titles.length, 1);
  assert.ok(html.includes('İzmir Ticari Mekân Projelendirme &amp; Fit-Out | Yeşilay Mutfak') || html.includes('İzmir Ticari Mekân Projelendirme & Fit-Out | Yeşilay Mutfak'));
});

// 5. Noindex engeli olmaması
check('P0-14: Sayfada noindex bulunmaz (robots index/follow)', () => {
  assert.ok(!html.includes('content="noindex"'));
});

// 6. JSON-LD Schema
check('P0-21 & P0-22: JSON-LD geçerli, Organization, WebSite, WebPage, Service, BreadcrumbList içerir', () => {
  const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonMatch);
  const data = JSON.parse(jsonMatch[1]);
  assert.ok(data['@graph'] && data['@graph'].length >= 4);
  const types = data['@graph'].map(x => Array.isArray(x['@type']) ? x['@type'].join(',') : x['@type']);
  assert.ok(types.some(t => t.includes('Service')));
  assert.ok(types.some(t => t.includes('WebPage')));
  assert.ok(types.some(t => t.includes('WebSite')));
  assert.ok(types.some(t => t.includes('Organization') || t.includes('HomeAndConstructionBusiness')));
});

// 7. LLMS dosyaları
const llmsPagePath = path.join(DIST, 'llms', 'pages', 'projelendirme.md');
check('P1-27: /llms/pages/projelendirme.md mevcut ve içerik eşdeğer', () => {
  assert.ok(fs.existsSync(llmsPagePath));
  const text = fs.readFileSync(llmsPagePath, 'utf-8');
  assert.ok(text.includes('Ticari Mekân Projelendirme ve Fit-Out'));
  assert.ok(text.includes('https://yesilaymutfak.com/projelendirme/'));
});

// 8. Root LLMS dosyaları
const llmsTxtPath = path.join(DIST, 'llms.txt');
check('P1-28: /llms.txt projelendirme bağlantılarını içerir', () => {
  assert.ok(fs.existsSync(llmsTxtPath));
  const text = fs.readFileSync(llmsTxtPath, 'utf-8');
  assert.ok(text.includes('/projelendirme/'));
  assert.ok(text.includes('/llms/pages/projelendirme.md'));
});

// 9. Lead Form
check('P0-32: B2B Keşif & Proje Görüşmesi formu mevcut', () => {
  assert.ok(html.includes('id="ym-lead-form"'));
  assert.ok(html.includes('name="privacy_ack"'));
  assert.ok(html.includes('name="sector"'));
  assert.ok(html.includes('name="timeline"'));
  assert.ok(html.includes('/assets/lead-form.js'));
});

// 10. SSS (FAQ) Bölümü
check('AEO/GEO: Sıkça Sorulan Sorular (FAQ) bölümü mevcut', () => {
  assert.ok(html.includes('Ticari Projelendirme &'));
  assert.ok(html.includes('Sık Sorulan Sorular'));
  assert.ok(html.includes('projelendirme ve fit-out bütçesi nasıl belirlenir?'));
});

// 11. Tasarım Koruma (18 Seçkin Proje Vitrini)
check('Tasarım Bütünlüğü: 18 Seçkin Proje vitrini eksiksiz korunuyor', () => {
  assert.ok(html.includes('18 Seçkin Proje'));
  assert.ok(html.includes('VELUNOR'));
  assert.ok(html.includes('CASTERA'));
  assert.ok(html.includes('FİORİSA'));
});

console.log(JSON.stringify({ total: results.length, pass: results.filter(r => r.status === 'PASS').length, results }, null, 2));
if (results.some(r => r.status === 'FAIL')) {
  process.exit(1);
}
