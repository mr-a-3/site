import {readJson,requestErrorResponse} from '../../../lib/request-security';
import {publicRateLimit} from '../../../lib/public-rate-limit';
import {db,getSettings,isAdmin,json,sameOrigin} from '../../../lib/store-server';
import {z} from 'zod';
export const dynamic='force-dynamic';
async function ready(){await db().prepare('CREATE TABLE IF NOT EXISTS store_activity (id TEXT PRIMARY KEY, session TEXT NOT NULL, product_id INTEGER NOT NULL, kind TEXT NOT NULL, color TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(session,product_id,kind,color))').run()}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Invalid origin'},403);
 let body;try{body=await readJson(req,2000)}catch(error){return requestErrorResponse(error)}const limited=await publicRateLimit(req,'analytics',600);if(limited)return limited;
 const parsed=z.object({session:z.string().uuid(),productId:z.number().int().positive(),kind:z.enum(['view','click','color']),color:z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()}).safeParse(body);
 if(!parsed.success)return json({error:'Invalid activity'},400);
 const a=parsed.data,{config}=await getSettings(),p=config.products.find(p=>p.id===a.productId);
 if(!p||(a.kind==='color'&&(!a.color||!p.colors.includes(a.color))))return json({error:'Unknown product or color'},400);
 await ready();await db().prepare('INSERT OR IGNORE INTO store_activity VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),a.session,a.productId,a.kind,a.kind==='color'?a.color!:'',new Date().toISOString()).run();return json({ok:true});
}
export async function GET(){if(!await isAdmin())return json({error:'Owner required'},403);await ready();const totals=await db().prepare('SELECT product_id,kind,color,COUNT(*) AS count FROM store_activity GROUP BY product_id,kind,color').all();const logs=await db().prepare('SELECT id,product_id,kind,color,created_at FROM store_activity ORDER BY created_at DESC LIMIT 200').all();return json({totals:totals.results,logs:logs.results})}
export async function DELETE(req:Request){if(!sameOrigin(req)||!await isAdmin())return json({error:'Owner required'},403);await ready();await db().prepare('DELETE FROM store_activity').run();return json({ok:true})}
