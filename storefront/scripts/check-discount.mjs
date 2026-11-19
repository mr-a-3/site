import assert from 'node:assert/strict';
const origin='http://127.0.0.1:5173';const headers={Cookie:'__sites_local_auth=1',Origin:origin,'Content-Type':'application/json'};
const read=async()=>{const r=await fetch(origin+'/api/settings',{headers});assert.equal(r.status,200);return r.json()};
const before=await read();
const save=(config,revision)=>fetch(origin+'/api/settings',{method:'PUT',headers,body:JSON.stringify({config,revision})});
for(const amount of [-1,before.config.products[0].price,before.config.products[0].price+1,1.234]){const invalid=structuredClone(before.config);invalid.products[0].discountPrice=amount;assert.equal((await save(invalid,before.revision)).status,400)}
try {
const demo=structuredClone(before.config);demo.products[0].discountPrice=Math.round(demo.products[0].price*70)/100;
assert.equal((await save(demo,before.revision)).status,200);
const after=await read();assert.equal(after.config.products[0].discountPrice,demo.products[0].discountPrice);assert.equal(after.config.products[0].price,before.config.products[0].price);
console.log('Passed: discount validation, persistence, original price preserved.');
} finally {const latest=await read();assert.equal((await save(before.config,latest.revision)).status,200,'Restore original settings');}
