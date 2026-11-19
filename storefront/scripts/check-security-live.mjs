// Read-only live checks. Invalid write requests must fail before changing saved data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root='http://127.0.0.1:5173',lan=new URL(fs.readFileSync('PHONE-LINK.txt','utf8').match(/http:\/\/\S+/)[0]).origin;
const phone={Cookie:'store_phone='+fs.readFileSync('.phone-access-key','utf8').trim()};
const owner={Cookie:'__sites_local_auth=1',Origin:root,'Content-Type':'application/json'};
const call=(path,method='GET',body,headers={})=>fetch(root+path,{method,redirect:'manual',headers,...(body!==undefined?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});
for(const path of ['/api/settings','/api/orders','/api/customer-orders','/api/analytics','/api/reviews']){
 assert.equal((await call(path)).status,403,path+' anonymous denied');
 assert.equal((await call(path,'GET',undefined,{'oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'})).status,403,'Forged identity denied');
}
const current=await call('/api/settings','GET',undefined,owner).then(r=>r.json());
assert.ok(current.config&&Number.isSafeInteger(current.revision));
for(const [path,method] of [['/api/settings','PUT'],['/api/upload','POST'],['/api/orders','POST'],['/api/customer-orders','PATCH'],['/api/analytics','DELETE']])assert.equal((await call(path,method,{}, {...owner,Origin:'https://attacker.invalid'})).status,403);
assert.equal((await call('/api/settings','PUT','null',owner)).status,400);
assert.equal((await call('/api/settings','PUT','[]',owner)).status,400);
assert.equal((await call('/api/settings','PUT',{config:current.config,revision:'0'},owner)).status,400);
if(current.revision>0)assert.equal((await call('/api/settings','PUT',{config:current.config,revision:current.revision-1},owner)).status,409);
const galleryBad=structuredClone(current.config);galleryBad.products[0].images=Array.from({length:4},(_,i)=>'https://example.invalid/'+i+'.jpg');assert.equal((await call('/api/settings','PUT',{config:galleryBad,revision:current.revision},owner)).status,400);
const bad=structuredClone(current.config);bad.products[0].price=-1;
assert.equal((await call('/api/settings','PUT',{config:bad,revision:current.revision},owner)).status,400);
bad.products[0].price=1;bad.contacts.instagram='javascript:alert(1)';
assert.equal((await call('/api/settings','PUT',{config:bad,revision:current.revision},owner)).status,400);
assert.equal((await call('/api/upload','POST','<svg onload="alert(1)"/>',{...owner,'Content-Type':'image/svg+xml'})).status,400);
assert.equal((await call('/api/upload','POST',String.fromCharCode(137,80,78,71),{...owner,'Content-Type':'image/png'})).status,400);
assert.equal((await call('/api/customer-orders','POST','x'.repeat(16000),{Origin:root,'Content-Type':'application/json'})).status,413);
assert.equal((await call('/api/customer-orders','POST','{}',{Origin:root,'Content-Type':'text/plain'})).status,415);
assert.equal((await call('/api/customer-orders','POST',{}, {Origin:'https://attacker.invalid','Content-Type':'application/json'})).status,403);
assert.equal((await call('/api/analytics','POST','{}',{Origin:root,'Content-Type':'text/plain'})).status,415);
const home=await call('/');const html=await home.text();const nonce=html.match(/<script nonce="([^"]+)"/)[1];
assert.ok(home.headers.get('content-security-policy').includes("'nonce-"+nonce+"'"));assert.equal(home.headers.get('x-frame-options'),'SAMEORIGIN');
assert.ok(html.includes('src="/storefront.js"'));
const storeData = JSON.parse(html.match(/window\.STORE_DATA=([\s\S]*?)<\/script>/)[1]);
assert.equal(storeData.products.some(product => 'weightKg' in product), false);
for (const method of ['bkash', 'nagad']) {
 if (!current.config.delivery[method].enabled) assert.equal('number' in storeData.delivery[method], false);
}
assert.equal((await call('/admin/script.js')).status, 403);
const ownerScript = await call('/admin/script.js', 'GET', undefined, owner);
assert.equal(ownerScript.status, 200);
assert.match(ownerScript.headers.get('cache-control'), /no-store/);
assert.doesNotMatch(await ownerScript.text(), /sourceMappingURL/);
const after=await call('/api/settings','GET',undefined,owner).then(r=>r.json());
assert.equal(after.revision,current.revision,'Invalid requests cannot save settings');assert.deepEqual(after.config,current.config);
for(const path of ['/admin','/api/settings','/api/orders','/api/customer-orders','/api/analytics','/cdn-cgi/local/explorer/api'])assert.equal((await fetch(lan+path,{headers:{...owner,...phone},redirect:'manual'})).status,404,'LAN keeps private path blocked: '+path);
const lanHome=await fetch(lan+'/',{headers:phone});assert.equal(lanHome.status,200);assert.ok(lanHome.headers.has('content-security-policy'));
for (const [origin, headers] of [[root, {}], [lan, phone]]) {
 const script = await fetch(origin + '/storefront.js', {headers});
 assert.equal(script.status, 200);
 assert.match(script.headers.get('content-type'), /application\/javascript/);
 assert.doesNotMatch(await script.text(), /sourceMappingURL/);
 for (const path of ['/app.js', '/admin.js', '/client/app.js', '/lib/store-server.ts', '/PHONE-LINK.txt', '/.phone-access-key', '/package.json', '/storefront.js.map', '/editorial/hero.js.map', '/@fs/D:/site/storefront/client/app.js']) {
  assert.equal((await fetch(origin + path, {headers})).status, 404, 'Private path blocked: ' + path);
 }
}
assert.equal((await fetch(lan + '/admin/script.js', {headers:phone})).status, 404);
assert.equal((await fetch(lan+'/api/customer-orders',{method:'POST',headers:{...phone,Origin:lan,'Content-Type':'text/plain'},body:'{}'})).status,415);
assert.equal((await fetch(lan+'/api/customer-orders',{method:'POST',headers:{...phone,Origin:'https://attacker.invalid','Content-Type':'application/json'},body:'{}'})).status,403);
console.log('PASS: live anonymous/forged-header denial, CSRF rejection, malformed and oversized input, unsafe images/links/prices, stale-save conflicts, security headers, unchanged settings, and private APIs excluded from the LAN preview.');

