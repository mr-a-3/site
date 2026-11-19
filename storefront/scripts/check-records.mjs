import assert from 'node:assert/strict';import fs from 'node:fs';
const origin='http://127.0.0.1:5173';const headers={Cookie:'__sites_local_auth=1',Origin:origin,'Content-Type':'application/json'};const url=origin+'/api/orders';const ids=[];
const send=(method,data,extra={})=>fetch(url,{method,headers:{...headers,...extra},body:JSON.stringify(data)});
assert.equal((await fetch(url)).status,403);
assert.equal((await send('POST',{}, {Origin:'https://example.com'})).status,403);
const {config}=await fetch(origin+'/api/settings',{headers}).then(r=>r.json());const product=config.products[0];assert.equal(config.currency,'BDT');
try{
for(const type of ['purchase','sale']){const payload={recordType:type,customer:'Verification '+type,phone:'+8801700000000',items:[{productId:product.id,quantity:2,unitPrice:20}]};const r=await send('POST',payload);assert.equal(r.status,201,await r.clone().text());const {id}=await r.json();ids.push(id);fs.writeFileSync('D:/site/storefront/logs/order-test-cleanup.sql',`DELETE FROM store_orders WHERE id IN (${ids.map(id=>"'"+id+"'").join(',')});`);const list=await fetch(url,{headers}).then(r=>r.json());const record=list.orders.find(o=>o.id===id);assert.equal(record.total_minor,type==='purchase'?4000:Math.round((product.discountPrice??product.price)*100)*2);assert.equal(record.record_type,type);assert.equal(record.currency,'BDT');for(const status of ['confirmed','sold','cancelled'])assert.equal((await send('PATCH',{id,status})).status,200);assert.equal((await send('PATCH',{id,status:'invalid'})).status,400)}
assert.equal((await send('POST',{recordType:'purchase',customer:'Invalid',phone:'+8801700000000',items:[{productId:product.id,quantity:1,unitPrice:-1}]})).status,400);
console.log('Passed: BDT, owner access, origin checks, purchase costs, server-priced sales, persistence and status changes.');
}finally{console.log('Verification record IDs saved for cleanup.');}
