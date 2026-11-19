// Schema-only gallery checks. No network or database writes.
import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';import {z} from 'zod';
const compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8').replace(/^import .*;\r?$/gm,'').replace(/^export /gm,''),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const deliverySchema=new Function('z',compile('lib/delivery-config.ts')+';return deliverySchema')(z);
const {schema,fields}=new Function('z','deliverySchema',compile('lib/store-config.ts')+';return {schema:configSchema,fields:textFields}')(z,deliverySchema);
const base={brand:'Gallery check',currency:'BDT',texts:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v[1]])),storyImage:'https://example.invalid/story.jpg',contacts:{phone:'',whatsapp:'',email:'',address:'',instagram:'',facebook:''},products:JSON.parse(fs.readFileSync('data/default-products.json','utf8'))};
const original=schema.parse(base);assert.deepEqual(original.products[0].images,[]);assert.equal(original.products[0].image,base.products[0].image);
const valid=structuredClone(base);valid.products[0].images=['https://example.invalid/second.jpg','https://example.invalid/third.webp','/media/1234abcd-5678.png'];const parsed=schema.parse(valid);assert.equal(1+parsed.products[0].images.length,4);assert.deepEqual(schema.parse(JSON.parse(JSON.stringify(parsed))).products,parsed.products);
for(const images of [[...valid.products[0].images,'https://example.invalid/fifth.jpg'],[valid.products[0].image],['javascript:alert(1)'],['data:image/svg+xml,<svg/>'],['file:///private.png'],['https://example.invalid/a.jpg','https://example.invalid/a.jpg']]){const bad=structuredClone(base);bad.products[0].images=images;assert.equal(schema.safeParse(bad).success,false)}
const withColors=structuredClone(base);
withColors.products[0].colors=['#222222','#C5B192'];
const pair=['https://example.invalid/front.jpg','https://example.invalid/side.jpg'];
withColors.products[0].colorImages={'#222222':pair,'#c5b192':[pair[0]]};
const withColorsSaved=schema.parse(JSON.parse(JSON.stringify(schema.parse(withColors))));
assert.deepEqual(withColorsSaved.products[0].colorImages,withColors.products[0].colorImages);
assert.equal(original.products[0].colorImages,undefined);
for(const colorImages of [
 {'#111111':pair},{'#222222':[]},{'#222222':[...pair,'https://example.invalid/back.jpg']},
 {'#222222':[pair[0],pair[0]]},{'#222222':['javascript:alert(1)']},
]){
 const bad=structuredClone(withColors);
 bad.products[0].colorImages=colorImages;
 assert.equal(schema.safeParse(bad).success,false);
}
console.log('PASS: shared and colour-specific galleries round trip, preserve old covers, and reject invalid photos and colours.');
