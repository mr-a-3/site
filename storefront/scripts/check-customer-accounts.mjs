// Local-only integration check. Creates one unique account + pending review,
// then removes only that account's exact IDs. Never publishes the review.
import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';
const origin='http://127.0.0.1:5173',suffix=crypto.randomUUID(),email='review-check-'+suffix+'@example.invalid',name='Account verification '+suffix,password=crypto.randomUUID()+crypto.randomUUID();let id;
const sqlite=new DatabaseSync('D:/site/storefront/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite');
async function send(base,path,body,cookie=''){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return r}
const cookies=r=>r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
try{
 assert.equal((await send(origin,'/api/customer-auth/ok')).status,200);
 let r=await send(origin,'/api/customer-auth/sign-up/email',{email,password,name});assert.equal(r.status,200,'Sign-up must work');let cookie=cookies(r);const signed=await r.json();id=signed.user.id;
 assert.equal((await (await send(origin,'/api/customer-auth/get-session',null,cookie)).json()).user.id,id);
 const product=await fetch(origin+'/api/settings',{headers:{Cookie:'__sites_local_auth=1'}}).then(r=>r.json()).then(d=>d.config.products.find(p=>p.showReviews!==false));assert.ok(product);
 const review={action:'submit',productId:product.id,name:'Forged name',rating:4,body:'Temporary account integration check '+suffix};
 assert.equal((await send(origin,'/api/reviews',review)).status,401);
 assert.equal((await send(origin,'/api/reviews',review,cookie)).status,201);
 const saved=sqlite.prepare('SELECT name,status,customer_id FROM product_reviews WHERE customer_id=? AND body=?').get(id,review.body);assert.equal(saved.name,name);assert.equal(saved.status,'pending');assert.equal(saved.customer_id,id);
 r=await send(origin,'/api/customer-auth/sign-out',{},cookie);assert.equal(r.status,200);
 assert.equal(await (await send(origin,'/api/customer-auth/get-session',null,cookie)).json(),null);
 assert.equal((await send(origin,'/api/reviews',review,cookie)).status,401);
 assert.equal((await send(origin,'/api/customer-auth/sign-in/email',{email,password:'incorrect-password-value'})).status,401);
 r=await send(origin,'/api/customer-auth/sign-in/email',{email,password});assert.equal(r.status,200);cookie=cookies(r);
 assert.equal((await fetch(origin+'/api/customer-auth/sign-in/email',{method:'POST',headers:{Origin:'https://example.invalid','Content-Type':'application/json'},body:JSON.stringify({email,password})})).status,403);
 if(process.argv.includes('--phone')){
  const link=new URL(fs.readFileSync('PHONE-LINK.txt','utf8').match(/http:\/\/\S+/)[0]);const base=link.origin,privateCookie='store_phone='+fs.readFileSync('.phone-access-key','utf8').trim();
  assert.equal((await fetch(base+'/')).status,403);
  r=await send(base,'/api/customer-auth/sign-in/email',{email,password},privateCookie);assert.equal(r.status,200,'Phone login must work');const phoneCookie=privateCookie+'; '+cookies(r);
  assert.equal((await (await send(base,'/api/customer-auth/get-session',null,phoneCookie)).json()).user.id,id);
  assert.equal((await send(base,'/api/reviews',{...review,body:review.body+' phone'},phoneCookie)).status,201);
  assert.equal((await fetch(base+'/admin',{headers:{Cookie:phoneCookie}})).status,404);
 }
 console.log('PASS: customer signup/login/logout, session revocation, anonymous review rejection, account-bound reviews, CSRF'+(process.argv.includes('--phone')?' and private phone login.':'.'));
}finally{
 const row=sqlite.prepare('SELECT id FROM customer_auth_user WHERE email=? AND name=?').get(email,name);
 if(row){id=row.id;sqlite.prepare('DELETE FROM product_reviews WHERE customer_id=? AND body LIKE ?').run(id,'Temporary account integration check '+suffix+'%');sqlite.prepare('DELETE FROM customer_auth_session WHERE userId=?').run(id);sqlite.prepare('DELETE FROM customer_auth_account WHERE userId=?').run(id);sqlite.prepare('DELETE FROM customer_auth_user WHERE id=? AND email=?').run(id,email);console.log('Removed only the unique verification account and its pending reviews.')}
 sqlite.close();
}
