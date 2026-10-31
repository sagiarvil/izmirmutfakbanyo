import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';

const ORIGIN = 'https://yesilaymutfak.com';
const originalFetch = globalThis.fetch;
const valid = {
 name:'Aylin Ece', company:'Örnek Mağaza', phone:'0532 123 45 67',
 email:'aylin@example.test', sector:'magaza', district:'İzmir Bayraklı',
 timeline:'hemen', area_m2:'140', description:'Konsept mağaza açılışı',privacy_ack:true,
 idempotency_key:'c0f77a00-ae52-43dc-b51b-ae8224f42876',turnstile_token:'test-token'
};
function createDB() {
 const rows=[];
 const prepared = {
  bind(...args){this.args=args;return this;},
  async first(){
   const sql=this.sql;
   if(sql.includes('WHERE idempotency_key=?')) return rows.find(x=>x.idempotency_key===this.args[0])||null;
   if(sql.includes('COUNT(*) AS n')) return {n:rows.filter(x=>x.ip_hash===this.args[0] && x.created_at>=this.args[1]).length};
   throw new Error(`unexpected first query ${sql}`);
  },
  async run(){
   if(this.sql.startsWith('INSERT INTO leads')) {
    const [id,idempotency_key,created_at,ip_hash,name,company,phone,email,sector,district,timeline,area_m2,description,role,budget_band,utm_source,utm_medium,utm_campaign,marketing_opt_in,privacy_ack]=this.args;
    rows.push({id,idempotency_key,created_at,ip_hash,name,company,phone,email,sector,district,timeline,area_m2,description,role,budget_band,utm_source,utm_medium,utm_campaign,marketing_opt_in,privacy_ack});
    return {success:true};
   }
   throw new Error(`unexpected run ${this.sql}`);
  }
 };
 return {rows, db:{prepare(sql){return {...prepared,sql}}}};
}
function makeReq(data=valid,{origin=ORIGIN,method='POST',contentType='application/json'}={}){
 return new Request(`${ORIGIN}/api/lead-projelendirme`,{method,
  headers:{Origin:origin,'Content-Type':contentType,'CF-Connecting-IP':'198.51.100.4'},
  body:method==='POST'?JSON.stringify(data):undefined});
}
function envFor(db){return {DB:db,TURNSTILE_SECRET:'testsecret', IP_HMAC_SECRET:'long-test-secret',PUBLIC_ORIGIN:ORIGIN};}
function ctxFor(){return {waitUntil(p){p.catch(()=>{});}};}
const fakeTurnstile = async (_url,_opts)=>new Response(JSON.stringify({success:true,hostname:'yesilaymutfak.com',action:'projelendirme_lead'}),{status:200,headers:{'Content-Type':'application/json'}});

test('API: persists verified request and deduplicates same idempotency', async()=>{
 const {db,rows}=createDB();
 globalThis.fetch=fakeTurnstile;
 try {
  const r1=await worker.fetch(makeReq(),envFor(db),ctxFor());
  assert.equal(r1.status,201);assert.equal((await r1.json()).accepted,true);assert.equal(rows.length,1);
  const r2=await worker.fetch(makeReq(),envFor(db),ctxFor());
  assert.equal(r2.status,200);assert.equal((await r2.json()).duplicate,true);assert.equal(rows.length,1);
 }finally{globalThis.fetch=originalFetch;}
});
test('API: cannot save without valid CAPTCHA',async()=>{
 const {db,rows}=createDB();
 globalThis.fetch=async()=>new Response(JSON.stringify({success:false}),{status:200});
 try{const r=await worker.fetch(makeReq(),envFor(db),ctxFor());assert.equal(r.status,403);assert.equal(rows.length,0);}
 finally{globalThis.fetch=originalFetch;}
});
test('API: mismatched Turnstile hostname rejected',async()=>{
 const {db,rows}=createDB();
 globalThis.fetch=async()=>new Response(JSON.stringify({success:true,hostname:'example.org',action:'projelendirme_lead'}),{status:200});
 try{const r=await worker.fetch(makeReq(),envFor(db),ctxFor());assert.equal(r.status,403);assert.equal(rows.length,0);}
 finally{globalThis.fetch=originalFetch;}
});
test('API: different origin rejected before any write',async()=>{
 const {db,rows}=createDB();const r=await worker.fetch(makeReq(valid,{origin:'https://attacker.example'}),envFor(db),ctxFor());assert.equal(r.status,403);assert.equal(rows.length,0);
});
test('API: rejects wrong JSON values',async()=>{
 const {db,rows}=createDB();const r=await worker.fetch(makeReq({...valid,phone:'xxx'}),envFor(db),ctxFor());assert.equal(r.status,400);assert.equal(rows.length,0);
});
test('API: rate limit after ten saved requests in 24h',async()=>{
 const {db,rows}=createDB();globalThis.fetch=fakeTurnstile;
 try {
  for(let i=0;i<10;i++) {
   const data={...valid,idempotency_key:`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`};
   const r=await worker.fetch(makeReq(data),envFor(db),ctxFor());assert.equal(r.status,201);
  }
  assert.equal(rows.length,10);
  const data={...valid,idempotency_key:'00000000-0000-4000-8000-000000000011'};
  const r=await worker.fetch(makeReq(data),envFor(db),ctxFor());assert.equal(r.status,429);assert.equal(rows.length,10);
 }finally{globalThis.fetch=originalFetch;}
});
