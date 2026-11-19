import {env} from 'cloudflare:workers';
import {betterAuth,type BetterAuthOptions} from 'better-auth';
import {getMigrations} from 'better-auth/db/migration';
import {db} from './store-server';

let instance:ReturnType<typeof betterAuth>|undefined;
let initializing:Promise<ReturnType<typeof betterAuth>>|undefined;
export async function customerAuth():Promise<ReturnType<typeof betterAuth>>{
 if(instance)return instance;
 if(initializing)return initializing;
 initializing=(async()=>{
  let secret=(env as unknown as Record<string,string>).BETTER_AUTH_SECRET;
  if(!secret&&import.meta.env.DEV){
   // Persistent local-only signing key; never sent to browsers or logged.
   await db().prepare('CREATE TABLE IF NOT EXISTS customer_auth_config (id INTEGER PRIMARY KEY,secret TEXT NOT NULL)').run();
   await db().prepare('INSERT OR IGNORE INTO customer_auth_config (id,secret) VALUES (1,?)').bind(crypto.randomUUID()+crypto.randomUUID()).run();
   secret=(await db().prepare('SELECT secret FROM customer_auth_config WHERE id=1').first<{secret:string}>())!.secret;
  }
  if(!secret)throw Error('Customer sign-in is currently unavailable.');
  const baseURL=import.meta.env.DEV?'http://127.0.0.1:5173':(env as unknown as Record<string,string>).BETTER_AUTH_URL;
  if(!baseURL)throw Error('Customer sign-in is currently unavailable.');
  const options:BetterAuthOptions={database:db(),secret,baseURL,basePath:'/api/customer-auth',
   emailAndPassword:{enabled:true,minPasswordLength:10,maxPasswordLength:128},
   user:{modelName:'customer_auth_user'},session:{modelName:'customer_auth_session',expiresIn:60*60*24*7,cookieCache:{enabled:false}},account:{modelName:'customer_auth_account'},verification:{modelName:'customer_auth_verification'},
   advanced:{cookiePrefix:'store_customer',useSecureCookies:!import.meta.env.DEV},
   rateLimit:{enabled:true,storage:'database',modelName:'customer_auth_rate_limit'},
   trustedOrigins:import.meta.env.DEV?[baseURL,'http://localhost:5173']:[baseURL],
  };
  const auth=betterAuth(options);
  // Only additive auth tables. No store settings or business records are changed.
  const migration=await getMigrations(auth.options);await migration.runMigrations();
  instance=auth;return auth;
 })();
 try{return await initializing!}catch(e){initializing=undefined;throw e}
}
export async function customerSession(req:Request){
 const cookie=req.headers.get('cookie')||'';
 if(!cookie.includes('store_customer.session_token='))return null;
 const auth=await customerAuth();return auth.api.getSession({headers:req.headers});
}
