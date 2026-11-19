/** Enforce byte limits while streaming, before allocating an entire request body. */
export class RequestError extends Error {
  constructor(message:string,public status:number){super(message)}
}
export async function readBytes(req:Request,maxBytes:number):Promise<Uint8Array>{
  const declared=req.headers.get('content-length');
  if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw new RequestError('Request too large',413);
  if(!req.body)return new Uint8Array();
  const reader=req.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){void reader.cancel().catch(()=>{});throw new RequestError('Request too large',413)}chunks.push(value)}}finally{reader.releaseLock()}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes;
}
export async function readJson(req:Request,maxBytes:number):Promise<Record<string,unknown>>{
  if(req.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new RequestError('JSON required',415);
  const bytes=await readBytes(req,maxBytes);let value;
  try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch{throw new RequestError('Invalid JSON',400)}
  if(!value||typeof value!=='object'||Array.isArray(value))throw new RequestError('JSON object required',400);
  return value;
}
export function requestErrorResponse(error:unknown):Response{
  if(!(error instanceof RequestError))throw error;
  return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
