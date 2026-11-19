import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { configSchema, textFields, type StoreConfig } from './store-config';
import products from '../data/default-products.json';
export const defaults:StoreConfig=configSchema.parse({brand:'form',currency:'BDT',texts:Object.fromEntries(Object.entries(textFields).map(([k,v])=>[k,v[1]])) as StoreConfig['texts'],storyImage:'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1300&q=85',contacts:{whatsapp:'',phone:'',email:'',facebook:'',instagram:'',address:''},products});
export function db(){if(!env.DB)throw new Error('Storage is unavailable');return env.DB}
export async function getSettings(){const row=await db().prepare('SELECT value, revision, updated_at FROM store_settings WHERE id=1').first<{value:string,revision:number,updated_at:string}>();return row?{config:configSchema.parse(JSON.parse(row.value)),revision:row.revision,updatedAt:row.updated_at}:{config:defaults,revision:0,updatedAt:null}}
export async function isAdmin(){const h=await headers();const id=h.get('oai-authenticated-user-id');const email=h.get('oai-authenticated-user-email')?.toLowerCase();if(!id||!email||(!import.meta.env.DEV&&id==='local_seedy'))return false;const existing=await db().prepare('SELECT user_id FROM store_admin WHERE id=1').first<{user_id:string}>();if(existing)return existing.user_id===id;
  const local=import.meta.env.DEV&&id==='local_seedy'&&email==='seedy@sites.test';
  if(email!=='academic.mojaru2026@gmail.com'&&!local)return false;
  await db().prepare('INSERT OR IGNORE INTO store_admin (id,user_id) VALUES (1,?)').bind(id).run();
  const owner=await db().prepare('SELECT user_id FROM store_admin WHERE id=1').first<{user_id:string}>();return owner?.user_id===id;
}
export function sameOrigin(req:Request){return req.headers.get('sec-fetch-site')!=='cross-site'&&req.headers.get('origin')===new URL(req.url).origin}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function htmlResponse(html:string){
 const nonce=crypto.randomUUID().replaceAll('-','');
 const secured=html.replace(/<script\b(?![^>]*\bsrc=)([^>]*)>/gi,(_,attrs)=>'<script nonce="'+nonce+'"'+attrs+'>');
 const policy=["default-src 'self'","script-src 'self' 'nonce-"+nonce+"'"+(import.meta.env.DEV?" 'unsafe-eval'":""),"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com","font-src 'self' https://fonts.gstatic.com","img-src 'self' https: data: blob:","connect-src 'self'"+(import.meta.env.DEV?" ws: wss:":""),"frame-ancestors 'self'","object-src 'none'","base-uri 'none'","form-action 'self'"].join('; ');
 return new Response(secured,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':policy}});
}
