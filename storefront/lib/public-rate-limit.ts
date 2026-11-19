import {db,json} from './store-server';

/** Persistent atomic counters; never trust arbitrary X-Forwarded-For headers. */
export async function publicRateLimit(req:Request,scope:string,limit:number,seconds=60,scopeWide=false):Promise<Response|null>{
  // Local preview has a separate per-socket-IP limiter at its LAN boundary.
  // Production is behind the hosting platform's Cloudflare ingress.
  const ip=scopeWide?'all':import.meta.env.DEV?'local-preview':req.headers.get('cf-connecting-ip')||'unknown-ingress';
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(scope+':'+ip));
  const key=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  const now=Math.floor(Date.now()/1000),window=Math.floor(now/seconds)*seconds;
  await db().prepare('CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL)').run();
  const row=await db().prepare('INSERT INTO request_limits (key,window,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN request_limits.window=excluded.window THEN request_limits.count+1 ELSE 1 END,window=excluded.window WHERE request_limits.window!=excluded.window OR request_limits.count<? RETURNING count').bind(key,window,limit).first();
  if(Math.random()<.01)await db().prepare('DELETE FROM request_limits WHERE window<?').bind(now-86400).run();
  if(row)return null;const response=json({error:seconds===60?'Too many requests. Please wait a minute and try again.':'Request limit reached. Try again later.'},429);response.headers.set('Retry-After',String(window+seconds-now));return response;
}
