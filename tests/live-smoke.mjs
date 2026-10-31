// Read-only test after live deployment. Only uses Node 20+ built-in fetch.
import assert from 'node:assert/strict';
const BASE = process.env.SITE_ORIGIN || 'https://yesilaymutfak.com';
const target = `${BASE}/projelendirme/`;
const results = [];
async function check(name, run) {
  try { await run(); results.push({test:name,passed:true}); }
  catch(e) { results.push({test:name,passed:false,reason:e.message}); }
}
let html='';
await check('Page HTTP 200 and substantial text', async()=>{
  const r=await fetch(target,{redirect:'follow'});
  assert.equal(r.status,200);
  html=await r.text();
  assert.ok(html.length>1000);
});
if(html) {
  await check('canonical same target', async()=>assert.match(html,/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/yesilaymutfak\.com\/projelendirme\/["']/i));
  await check('single H1 (warning if JS-only)', async()=>assert.equal((html.match(/<h1(?:\s|>)/ig)||[]).length,1));
  await check('one <title>', async()=>assert.equal((html.match(/<title(?:\s|>)/ig)||[]).length,1));
  await check('single canonical', async()=>assert.equal((html.match(/rel=["']canonical["']/ig)||[]).length,1));
  await check('no index block', async()=>assert.doesNotMatch(html,/<meta[^>]+content=["'][^"']*noindex/ig));
}
await check('sitemap contains target',async()=>{const r=await fetch(`${BASE}/sitemap.xml`);assert.equal(r.status,200);assert.ok((await r.text()).includes(target));});
await check('llms page exists',async()=>{const r=await fetch(`${BASE}/llms/pages/projelendirme.md`);assert.equal(r.status,200);assert.ok((await r.text()).includes('Ticari Mekân'));});
console.log(JSON.stringify({site:target,results},null,2));
if(results.some(x=>!x.passed))process.exitCode=1;
