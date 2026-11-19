import {customerAuth} from '../../../../lib/customer-auth';
import {sameOrigin,json} from '../../../../lib/store-server';
import {publicRateLimit} from '../../../../lib/public-rate-limit';
import {readJson,requestErrorResponse} from '../../../../lib/request-security';
import {z} from 'zod';
export const dynamic='force-dynamic';
const credentials=z.object({email:z.string().trim().email().max(254),password:z.string().min(10).max(128)});
async function handle(req:Request){
 const path=new URL(req.url).pathname.replace('/api/customer-auth','');
 if(!(req.method==='GET'?['/get-session','/ok']:['/sign-up/email','/sign-in/email','/sign-out']).includes(path))return json({error:'Not found'},404);
 if(req.method==='POST'){
  if(!sameOrigin(req))return json({error:'Invalid origin'},403);
  if(req.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'JSON required'},415);
  let body;try{body=await readJson(req,4000)}catch(e){return requestErrorResponse(e)}
  const limited=await publicRateLimit(req,'customer-auth:'+path,15);if(limited)return limited;
  if(path!=='/sign-out'){
   const parsed=(path==='/sign-up/email'?credentials.extend({name:z.string().trim().min(2).max(80)}):credentials).safeParse(body);
   if(!parsed.success)return json({error:'Enter a valid email, password (10–128 characters)'+(path==='/sign-up/email'?' and full name.':'.')},400);
   body=parsed.data;
  }else body={};
  if(path==='/sign-in/email'&&typeof body.email==='string'){const emailLimit=await publicRateLimit(req,'customer-login:'+body.email.trim().toLowerCase(),5);if(emailLimit)return emailLimit}
  req=new Request(req.url,{method:'POST',headers:req.headers,body:JSON.stringify(body)});
 }
 try{const auth=await customerAuth();const response=await auth.handler(req);response.headers.set('Cache-Control','no-store');return response}catch{return json({error:'Customer sign-in is currently unavailable. Please try again later.'},503)}
}
export const GET=handle;export const POST=handle;
