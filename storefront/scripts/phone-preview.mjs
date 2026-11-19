import {phoneAllowed} from './phone-access.mjs';
// Phone storefront preview. Owner tools remain on the computer's localhost.
import http from 'node:http';
import {createPreviewRateLimit} from './preview-rate-limit.mjs';
const allowRequest=createPreviewRateLimit();
const storefrontAssets = new Set([
  '/storefront.js', '/favicon.svg', '/location-pin.svg', '/bd-districts.json', '/bd-upazilas.json',
  '/styles.css', '/premium.css', '/experience.css', '/contact.css', '/crimson.css', '/clean.css',
  '/design-tokens.css', '/checkout.css', '/product-page.css', '/editorial/hero.js', '/editorial/hero.css',
  '/payment-logos/bkash.webp', '/payment-logos/nagad.webp',
]);
const host=process.argv[2];
if(!host||!(/^(192\.168\.|10\.)/.test(host)||/^172\.(1[6-9]|2\d|3[01])\./.test(host)))throw Error('Pass the computer Wi-Fi IPv4 address.');
const server=http.createServer(async(req,res)=>{
 try{
  if(req.headers.host!==host+':5174'){res.writeHead(403);res.end('Invalid host');return}
  const url=new URL(req.url,'http://localhost');const access=phoneAllowed(req,url);if(!access.allowed){res.writeHead(403,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('Private store preview. Open the phone link from your computer.');return}if(access.cookie)res.setHeader('Set-Cookie',access.cookie);url.searchParams.delete('access');let pathname;
  try{pathname=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}
  const customerAuthPost=['/api/customer-auth/sign-up/email','/api/customer-auth/sign-in/email','/api/customer-auth/sign-out'].includes(pathname);
  const customerAuthGet=req.method==='GET'&&['/api/customer-auth/get-session','/api/customer-auth/ok'].includes(pathname);
  // Forward only customer-session cookies, never the loopback owner identity.
  const customerCookies=(req.headers.cookie||'').split(';').map(v=>v.trim()).filter(v=>/^store_customer\.[a-z_]+=/.test(v)).join('; ');
  const publicPost=req.method==='POST'&&(['/api/customer-orders','/api/analytics','/api/reviews'].includes(pathname)||customerAuthPost);
  if(publicPost){
   if(!allowRequest(req.socket.remoteAddress||'unknown',pathname,pathname==='/api/analytics'?300:60)){res.writeHead(429,{'Content-Type':'application/json','Cache-Control':'no-store','Retry-After':'60'});res.end(JSON.stringify({error:'Too many requests. Please wait a minute.'}));return}
   if(req.headers['content-type']?.split(';')[0].trim().toLowerCase()!=='application/json'){res.writeHead(415);res.end('JSON required');return}
   if(Number(req.headers['content-length'])>16000){res.writeHead(413);res.end('Request too large');return}
   if(req.headers.origin!==`http://${host}:5174`){res.writeHead(403);res.end();return}
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16000){res.writeHead(413);res.end();return}chunks.push(chunk)}
   const upstream=await fetch('http://127.0.0.1:5173'+pathname,{method:'POST',headers:{'Content-Type':'application/json','Origin':'http://127.0.0.1:5173',...((customerAuthPost||pathname==='/api/reviews')&&customerCookies?{'Cookie':customerCookies}:{})},body:Buffer.concat(chunks),signal:AbortSignal.timeout(15000)});
   if(customerAuthPost){const cookies=upstream.headers.getSetCookie().filter(v=>v.startsWith('store_customer.'));if(cookies.length)res.setHeader('Set-Cookie',[...(access.cookie?[access.cookie]:[]),...cookies])}
   res.writeHead(upstream.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(Buffer.from(await upstream.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  const publicFile=storefrontAssets.has(pathname);
  const media=/^\/media\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(pathname);
  if(pathname!=='/'&&!publicFile&&!media&&!customerAuthGet){res.writeHead(404);res.end('Storefront preview only.');return}
  const upstream=await fetch('http://127.0.0.1:5173'+pathname,{method:req.method,headers:customerAuthGet?{'Origin':'http://127.0.0.1:5173',...(customerCookies?{'Cookie':customerCookies}:{})}:{},redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(customerAuthGet){const cookies=upstream.headers.getSetCookie().filter(v=>v.startsWith('store_customer.'));if(cookies.length)res.setHeader('Set-Cookie',[...(access.cookie?[access.cookie]:[]),...cookies])}
  const headers={};for(const key of ['content-type','cache-control','x-content-type-options','referrer-policy','content-security-policy','permissions-policy','x-frame-options'])if(upstream.headers.has(key))headers[key]=upstream.headers.get(key);
  res.writeHead(upstream.status,headers);res.end(req.method==='HEAD'?undefined:Buffer.from(await upstream.arrayBuffer()));
 }catch{res.writeHead(502);res.end('Start the store on localhost:5173 first.');}
});
server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;server.maxHeadersCount=40;server.maxRequestsPerSocket=100;
server.on('error',error=>{if(error.code==='EADDRINUSE'){console.log('Phone connection is already running.');process.exit(0)}console.error(error.message);process.exit(1)});
server.listen(5174,host,()=>console.log(`Phone preview: http://${host}:5174`));
