import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';
const root='http://127.0.0.1:5173',headers={Origin:root,'Content-Type':'application/json'},owner={...headers,Cookie:'__sites_local_auth=1'},url=root+'/api/customer-orders',ids=[];
const send=(method,body,h=headers)=>fetch(url,{method,headers:h,...(body?{body:JSON.stringify(body)}:{})});
try{
assert.equal((await fetch(url)).status,403);assert.equal((await send('POST',{action:'quote'},{...headers,Origin:'https://example.com'})).status,403);
const {config}=await fetch(root+'/api/settings',{headers:owner}).then(r=>r.json());const product=config.products.find(p=>p.stock===null||p.stock>0);const items=[{productId:product.id,quantity:1,...(product.colors[0]?{color:product.colors[0]}:{})}];
let r=await send('POST',{action:'quote',district:'Dhaka',items});assert.equal(r.status,200,await r.clone().text());const q=await r.json();assert.equal(q.subtotal,Math.round((product.discountPrice??product.price)*100));assert.equal(q.delivery,config.delivery.freeAbove!==null&&q.subtotal>=config.delivery.freeAbove*100?0:(config.delivery.dhaka+Math.ceil(Math.max(0,product.weightKg-config.delivery.baseWeight))*config.delivery.extraKg)*100);
const payload={action:'place',requestKey:crypto.randomUUID(),customer:'Checkout verification',phone:'01700000000',district:'Dhaka',area:'Savar',address:'Test address for verification',items,expectedTotal:q.total};
assert.equal((await send('POST',{...payload,area:'Nonexistent upazila'})).status,400);
assert.equal((await send('POST',{...payload,area:'__other__',otherArea:'Dhanmondi',expectedTotal:1})).status,409);
assert.equal((await send('POST',{...payload,expectedTotal:1})).status,409);
r=await send('POST',payload);assert.equal(r.status,201,await r.clone().text());const result=await r.json();ids.push(result.id);fs.writeFileSync('D:/site/storefront/logs/customer-order-test-cleanup.json',JSON.stringify(ids));assert.equal(result.total,q.total);
assert.equal((await send('POST',payload)).status,200);
assert.equal((await send('POST',{action:'track',id:result.id,phone:'01800000000'})).status,404);
assert.equal((await send('POST',{action:'track',id:result.id,phone:'+8801700000000'})).status,200);
assert.equal((await send('PATCH',{id:result.id,status:'confirmed',courier:'Manual',tracking:''})).status,403);
assert.equal((await send('PATCH',{id:result.id,status:'delivered',courier:'Manual',tracking:''},owner)).status,400);
for(const status of ['confirmed','shipped','delivered','refunded']){r=await send('PATCH',{id:result.id,status,courier:'Manual',tracking:'TEST-TRACK'},owner);assert.equal(r.status,200,await r.clone().text())}
const listing=await fetch(url,{headers:owner}).then(r=>r.json());assert.equal(listing.orders.find(o=>o.id===result.id).status,'refunded');
console.log('PASS: server pricing, delivery quote, tamper rejection, order creation, idempotency, tracking privacy, owner access, status transitions and refund record.');
}finally{if(ids.length){const sqlite=new DatabaseSync('D:/site/storefront/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite');for(const id of ids)sqlite.prepare('DELETE FROM customer_orders WHERE id=? AND customer=?').run(id,'Checkout verification');sqlite.close();console.log('Removed only verification orders.')}}
