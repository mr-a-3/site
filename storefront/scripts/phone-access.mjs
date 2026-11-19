import fs from 'node:fs';
import {randomBytes,timingSafeEqual} from 'node:crypto';
export function phoneKey(){if(!fs.existsSync('.phone-access-key'))fs.writeFileSync('.phone-access-key',randomBytes(32).toString('hex'),{flag:'wx'});return fs.readFileSync('.phone-access-key','utf8').trim()}
export const phoneLink=host=>'http://'+host+':5174/?access='+phoneKey();
export function phoneAllowed(req,url){
 if(fs.existsSync('.phone-sharing'))return {allowed:true};
 const key=phoneKey();const token=url.searchParams.get('access')||(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('store_phone='))?.slice(12)||'';
 const allowed=/^[a-f0-9]{64}$/.test(token)&&timingSafeEqual(Buffer.from(token),Buffer.from(key));
 return {allowed,cookie:allowed&&url.searchParams.has('access')?'store_phone='+key+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000':null};
}
if(process.argv[2]==='share'){fs.writeFileSync('.phone-sharing','enabled');console.log('Other Wi-Fi users can now open the normal phone address. Run Private Store to block them again.')}
if(process.argv[2]==='private'){
 try{fs.unlinkSync('.phone-sharing')}catch(e){if(e.code!=='ENOENT')throw e}
 fs.writeFileSync('.phone-access-key',randomBytes(32).toString('hex'));
 if(fs.existsSync('PHONE-LINK.txt')){const url=new URL(fs.readFileSync('PHONE-LINK.txt','utf8').trim());fs.writeFileSync('PHONE-LINK.txt',phoneLink(url.hostname)+'\n')}
 console.log('Phone preview is private. Previous phone access has been revoked. Open PHONE-LINK.txt on your PC for your new phone link.');
}
