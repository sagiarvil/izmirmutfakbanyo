import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLead,normalizePhone,plainText} from '../worker/validation.mjs';
const sample = {
  name:'Ayşe Yılmaz',company:'Örnek AŞ',phone:'0532 123 45 67',
  sector:'magaza',district:'Bayraklı',timeline:'1-3-ay',privacy_ack:true,
  area_m2:'150',description:'Showroom yenileme',
  idempotency_key:'c0f77a00-ae52-43dc-b51b-ae8224f42876'
};
test('Türk telefon biçimleri normalize edilir',()=>{
  assert.equal(normalizePhone('0532 123 45 67'),'+905321234567');
  assert.equal(normalizePhone('+90 532 123 45 67'),'+905321234567');
  assert.equal(normalizePhone('5321234567'),'+905321234567');
});
test('geçerli form normalize edilir',()=>{
  const r=validateLead(sample);
  assert.equal(r.ok,true);
  assert.equal(r.data.phone,'+905321234567');
  assert.equal(r.data.area,150);
  assert.equal(r.data.marketing_opt_in,0);
});
test('aydınlatma okundu kaydı zorunlu, pazarlama izni değil',()=>{
  assert.equal(validateLead({...sample, privacy_ack:false}).ok,false);
  assert.equal(validateLead({...sample, marketing_opt_in:false}).ok,true);
});
test('boş veya geçersiz iletişim reddedilir',()=>{
  for(const phone of ['', '1234','0090877']) assert.equal(validateLead({...sample,phone}).ok,false);
});
test('sektör/başlangıç seçimi allowlist ile',()=>{
  assert.equal(validateLead({...sample,sector:'admin'}).ok,false);
  assert.equal(validateLead({...sample,timeline:'30-year'}).ok,false);
});
test('m2 uç değerleri sınırlandırılır',()=>{
  for(const area_m2 of ['-1','0','1000001','abc']) assert.equal(validateLead({...sample,area_m2}).ok,false);
  assert.equal(validateLead({...sample,area_m2:''}).ok,true);
});
test('HTML ve diğer metin veri olarak kalır, yürütülmez',()=>{
  const r=validateLead({...sample,description:'<script>alert(1)</script>'});
  assert.equal(r.ok,true);
  assert.equal(r.data.description,'<script>alert(1)</script>');
  // MUST NEVER interpolate arbitrary description into innerHTML in any downstream CRM app.
});
test('normalization string boyut sınırı',()=>assert.ok(plainText('a'.repeat(2000),1200).length<=1200));
test('idempotency anahtarı beklenir',()=>assert.equal(validateLead({...sample,idempotency_key:'x'}).ok,false));
