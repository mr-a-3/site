/** Local preview throttling uses the actual socket peer, never client-supplied headers. */
export function createPreviewRateLimit({now=Date.now,maxKeys=4096}={}){
 const counters=new Map();
 return (ip,scope,limit,windowMs=60000)=>{
  const time=now(),key=ip+':'+scope;let entry=counters.get(key);
  if(!entry||entry.expires<=time){
   if(counters.size>=maxKeys){for(const [k,v] of counters)if(v.expires<=time)counters.delete(k);if(counters.size>=maxKeys)return false}
   entry={count:0,expires:time+windowMs};counters.set(key,entry);
  }
  if(entry.count>=limit)return false;entry.count++;return true;
 };
}
