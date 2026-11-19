// Read-only browser fixture. Pass --headphones for three colour-specific pairs.
import http from 'node:http';
const origin='http://127.0.0.1:5173',home=await fetch(origin),source=await home.text();
const match=source.match(/window\.STORE_DATA=([\s\S]*?)<\/script>/);if(!match)throw Error('Store data not found');
const config=JSON.parse(match[1]);
if (process.argv.includes('--headphones')) {
 const p=config.products.find(product=>product.name.toLowerCase()==='studio headphones');
 if (!p) throw Error('Studio headphones not found in the local catalog');
 const cover='https://images.unsplash.com/photo-1546435770-a3e426bf472b';
 const testPair=tint=>[
  `${cover}?auto=format&fit=crop&w=760&h=580${tint}`,
  `${cover}?auto=format&fit=crop&w=760&h=760${tint}`,
 ];
 p.colors=['#222222','#263650','#c5b192'];
 p.colorImages={
  '#222222':testPair(''),
  '#263650':testPair('&duotone=263650,e4edf7'),
  '#c5b192':testPair('&duotone=806848,f7eddd'),
 };
 p.image=p.colorImages['#222222'][0];
 p.images=[p.colorImages['#222222'][1]];
 p.featured=true;
 config.products=[p];
} else {
 const p=config.products[0];
 const cover=p.image.startsWith('photo-')?'https://images.unsplash.com/'+p.image:p.image;
 p.images=[1,2,3].map(n=>cover+(cover.includes('?')?'&':'?')+'auto=format&fit=crop&w='+(500+n*100));
}
const html=source.replace(match[0],'window.STORE_DATA='+JSON.stringify(config).replace(/</g,'\\u003c')+'</script>');
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://127.0.0.1');
 if(req.method==='GET'&&url.pathname==='/'){const headers=Object.fromEntries([...home.headers].filter(([k])=>!['content-length','content-encoding','transfer-encoding'].includes(k)));res.writeHead(200,headers);res.end(html);return}
 if(req.method==='POST'&&url.pathname==='/api/analytics'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{}');return}
 let body;if(req.method==='POST'&&url.pathname==='/api/reviews'){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>2000)throw Error('Too large');chunks.push(chunk)}body=Buffer.concat(chunks);if(JSON.parse(body).action!=='list'){res.writeHead(405);res.end();return}}
 else if(req.method!=='GET'||url.pathname==='/admin'||url.pathname.startsWith('/api/')&&url.pathname!=='/api/customer-auth/get-session'){res.writeHead(404);res.end();return}
 const upstream=await fetch(origin+url.pathname+url.search,{method:req.method,headers:body?{'Content-Type':'application/json',Origin:origin}:{},...(body?{body}:{})});
 res.writeHead(upstream.status,Object.fromEntries([...upstream.headers].filter(([k])=>!['content-length','content-encoding','transfer-encoding','set-cookie'].includes(k))));res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Gallery check failed')}});
server.listen(5186,'127.0.0.1',()=>console.log('Read-only gallery check ready on localhost:5186.'));
