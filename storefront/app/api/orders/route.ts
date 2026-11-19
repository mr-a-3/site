import {readJson,requestErrorResponse} from '../../../lib/request-security';
import {z} from 'zod';
import {db,getSettings,isAdmin,json,sameOrigin} from '../../../lib/store-server';
export const dynamic='force-dynamic';
const statuses=z.enum(['pending','confirmed','sold','cancelled','refunded']);
const orderSchema=z.object({recordType:z.enum(['purchase','sale']),customer:z.string().trim().min(1).max(100),phone:z.string().trim().regex(/^\+?[0-9 ()-]{7,25}$/),items:z.array(z.object({color:z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),unitPrice:z.number().finite().min(0).max(10000000).refine(n=>Math.abs(n*100-Math.round(n*100))<.000001).optional(),productId:z.number().int().positive(),quantity:z.number().int().min(1).max(100)})).min(1).max(100)});
export async function GET(){if(!await isAdmin())return json({error:'Owner sign-in required'},403);const result=await db().prepare('SELECT * FROM store_orders ORDER BY created_at DESC').all();return json({orders:result.results.map(row=>({...row,items:JSON.parse(row.items as string)}))})}
export async function POST(req:Request){
 if(!sameOrigin(req)||!await isAdmin())return json({error:'Owner access required'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
 let body;try{body=await readJson(req,20000)}catch(error){return requestErrorResponse(error)}
 const parsed=orderSchema.safeParse(body);if(!parsed.success)return json({error:'Enter a customer name, phone number and valid items.'},400);
 const {config}=await getSettings();const items=[];let total=0;
 for(const item of parsed.data.items){const product=config.products.find(p=>p.id===item.productId);if(!product)return json({error:'Product unavailable'},400);if(parsed.data.recordType==='purchase'&&item.unitPrice===undefined)return json({error:'Enter the purchase cost.'},400);if(item.color&&!product.colors.includes(item.color))return json({error:'Choose a product color.'},400);const unitMinor=Math.round((parsed.data.recordType==='purchase'?item.unitPrice!:(product.discountPrice??product.price))*100);total+=unitMinor*item.quantity;items.push({productId:product.id,name:product.name,quantity:item.quantity,color:item.color||null,unitMinor})}
 const id=crypto.randomUUID(),now=new Date().toISOString();
 await db().prepare('INSERT INTO store_orders (id,customer,phone,items,total_minor,currency,status,created_at,updated_at,record_type) VALUES (?,?,?,?,?,?,\'pending\',?,?,?)').bind(id,parsed.data.customer,parsed.data.phone,JSON.stringify(items),total,config.currency,now,now,parsed.data.recordType).run();
 return json({id},201);
}
export async function PATCH(req:Request){
 if(!sameOrigin(req)||!await isAdmin())return json({error:'Owner access required'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
 let body;try{body=await readJson(req,1000)}catch(error){return requestErrorResponse(error)}
 const parsed=z.object({id:z.string().uuid(),status:statuses}).safeParse(body);if(!parsed.success)return json({error:'Invalid order or status'},400);
 const updated=await db().prepare('UPDATE store_orders SET status=?,updated_at=? WHERE id=? RETURNING id').bind(parsed.data.status,new Date().toISOString(),parsed.data.id).first();
 return updated?json({ok:true}):json({error:'Order not found'},404);
}
