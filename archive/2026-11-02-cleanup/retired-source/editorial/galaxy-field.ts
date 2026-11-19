/** A softly projected spiral field. Canvas 2D gives depth without a WebGL download. */
export function createGalaxyField(canvas:HTMLCanvasElement,{animate}:{animate:boolean}){
 const context=canvas.getContext('2d',{alpha:true});if(!context)return()=>{};
 const ctx=context;const host=canvas.closest<HTMLElement>('.editorial-hero');if(!host)return()=>{};
 const lowPower=navigator.hardwareConcurrency<=4;
 let width=1,height=1,frame=0,lastFrame=0,disposed=false,dark=false;
 let pointerX=0,pointerY=0,smoothX=0,smoothY=0;
 const started=performance.now();
 let seed=4817;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 // Bake cloud wisps once. Each frame composites two textures instead of recalculating noise.
 const cloud=document.createElement('canvas');cloud.width=768;cloud.height=768;
 const brush=cloud.getContext('2d');
 if(brush){
  for(let i=0;i<680;i++){
   const r=35+random()*295,a=r*.018+(i%3)*Math.PI*2/3+(random()-.5)*.65;
   const x=384+Math.cos(a)*r,y=384+Math.sin(a)*r,s=12+random()*42;
   const glow=brush.createRadialGradient(x,y,0,x,y,s);
   glow.addColorStop(0,`rgba(${i%5===0?'244,112,130':'154,23,49'},${.025+random()*.055})`);glow.addColorStop(1,'rgba(116,9,23,0)');
   brush.fillStyle=glow;brush.fillRect(x-s,y-s,s*2,s*2);
  }
 }
 const count=lowPower?78:matchMedia('(max-width: 700px)').matches?105:210;
 const particles=Array.from({length:count},(_,i)=>({radius:Math.pow(random(),.65),angle:random()*Math.PI*2,arm:i%3,depth:random(),size:.45+random()*1.25,alpha:.12+random()*.32,phase:random()*Math.PI*2,field:i%5===0}));
 function render(now:number){
  const t=animate?(now-started)/1000:0;
  smoothX+=(pointerX-smoothX)*.035;smoothY+=(pointerY-smoothY)*.035;
  ctx.clearRect(0,0,width,height);
  const radius=Math.min(width*.49,height*.68),centerX=width*(width<700?.48:.31),centerY=height*.54;
  const rgb=dark?'232,190,202':'131,67,83';
  // Keep the luminous core at the outer edge, clear of the headline and product.
  ctx.save();ctx.translate(width*.08+smoothX*16,height*.2+smoothY*12);ctx.rotate(-.24+t*.009);
  const span=Math.min(width*.85,height*1.3);
  ctx.scale(1,.52);ctx.globalAlpha=dark?.65:.28;ctx.drawImage(cloud,-span/2,-span/2,span,span);
  ctx.rotate(-t*.014+.6);ctx.globalAlpha=dark?.32:.12;ctx.drawImage(cloud,-span*.57,-span*.57,span*1.14,span*1.14);
  const core=ctx.createRadialGradient(0,0,0,0,0,span*.16);
  core.addColorStop(0,dark?'#ffd6dd80':'#fff7ef80');core.addColorStop(.12,dark?'#ff354940':'#b5122618');core.addColorStop(1,'#b5122600');
  ctx.globalAlpha=1;ctx.fillStyle=core;ctx.fillRect(-span*.16,-span*.16,span*.32,span*.32);ctx.restore();
  for(const p of particles){
   let x:number,y:number,depth:number;
   if(p.field){x=(Math.cos(p.angle)*.5+.5)*width;y=(Math.sin(p.phase)*.5+.5)*height;depth=p.depth;}
   else{
    const r=(.12+p.radius*.88)*radius;
    const angle=p.arm*Math.PI*2/3+p.radius*4.8+p.angle*.21+t*(.035-.018*p.radius);
    const z=Math.sin(angle)*r*.5+(p.depth-.5)*90;
    const perspective=900/(900+z);
    x=centerX+Math.cos(angle)*r*perspective;
    y=centerY+Math.sin(angle)*r*.43*perspective+(p.depth-.5)*r*.12;
    depth=perspective*.7;
   }
   x+=smoothX*(10+depth*24);y+=smoothY*(7+depth*17);
   const breathing=animate?.8+.2*Math.sin(t*.32+p.phase):.9;
   const alpha=p.alpha*breathing*(dark?.95:.68);
   const size=p.size*(.6+depth*.6);
   ctx.fillStyle=`rgba(${rgb},${alpha})`;
   ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
   if(p.size>1.5&&p.depth>.78){ctx.strokeStyle=`rgba(${rgb},${alpha*.45})`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(x-size*3,y);ctx.lineTo(x+size*3,y);ctx.moveTo(x,y-size*3);ctx.lineTo(x,y+size*3);ctx.stroke()}
  }
 }
 function resize(){const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(devicePixelRatio||1,lowPower?1:1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render(performance.now())}
 function tick(now:number){if(disposed)return;if(now-lastFrame>=1000/(lowPower?20:30)){render(now);lastFrame=now}frame=requestAnimationFrame(tick)}
 function move(event:PointerEvent){if(event.pointerType!=='mouse'||lowPower)return;const r=host!.getBoundingClientRect();pointerX=(event.clientX-r.left)/r.width-.5;pointerY=(event.clientY-r.top)/r.height-.5}
 function leave(){pointerX=0;pointerY=0}
 function theme(){dark=document.documentElement.dataset.theme==='dark';if(!animate)render(performance.now())}
 theme();const observer=new ResizeObserver(resize);observer.observe(canvas);
 const themeObserver=new MutationObserver(theme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 if(animate){host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);frame=requestAnimationFrame(tick)}
 return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();themeObserver.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave)};
}
