window.mountProductGallery=(p,root)=>{
 const original=root.querySelector(':scope > img');if(!original)return;
 const defaultPhotos=[p.image,...(p.images||[])];
 const hasColorPhotos=Object.keys(p.colorImages||{}).length>0;
 const photosFor=color=>[...new Set(p.colorImages?.[color?.toLowerCase()]||defaultPhotos)].slice(0,4);
 let color=root.querySelector('.color-swatch[aria-pressed="true"]')?.dataset.color;
 let urls=photosFor(color);
 const gallery=document.createElement('section');gallery.className='product-gallery';gallery.setAttribute('aria-label','Product photos');const stage=document.createElement('div');stage.className='gallery-stage';original.before(gallery);gallery.append(stage);stage.append(original);original.draggable=false;
 if(urls.length<2&&!hasColorPhotos)return;
 const thumbs=document.createElement('div');thumbs.className='gallery-thumbs';thumbs.setAttribute('role','group');thumbs.setAttribute('aria-label','Choose product photo');gallery.append(thumbs);const counter=document.createElement('span');counter.className='gallery-counter';counter.setAttribute('aria-live','polite');stage.append(counter);let current=0,animation;
 const show=(index,animate=true)=>{current=(index+urls.length)%urls.length;animation?.cancel();original.src=imageUrl({...p,image:urls[current]});original.alt=p.name+' · photo '+(current+1);counter.textContent=(current+1)+' / '+urls.length;thumbs.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));if(animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches)animation=original.animate([{opacity:.45,transform:'translateX(6px)'},{opacity:1,transform:'translateX(0)'}],{duration:240,easing:'ease-out'})};
 function renderPhotos() {
  thumbs.replaceChildren();
  thumbs.hidden=counter.hidden=urls.length<2;
  if(urls.length>1)urls.forEach((url,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Show photo '+(i+1)+' of '+urls.length);const image=document.createElement('img');image.src=imageUrl({...p,image:url},120);image.alt='';image.loading='lazy';button.append(image);button.onclick=()=>show(i);thumbs.append(button)});
  show(0,false);
 }
 if(hasColorPhotos)root.querySelector('.color-options')?.addEventListener('click',event=>{
  const swatch=event.target.closest('.color-swatch');
  const nextColor=swatch?.dataset.color;
  if(!nextColor||nextColor===color||!p.colors.includes(nextColor))return;
  color=nextColor;
  urls=photosFor(color);
  renderPhotos();
 });
 gallery.addEventListener('keydown',e=>{if(urls.length>1&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();e.stopPropagation();show(current+(e.key==='ArrowRight'?1:-1));thumbs.children[current].focus()}});
 let touch;stage.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});stage.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length)return;const x=e.changedTouches[0].clientX-touch.x,y=e.changedTouches[0].clientY-touch.y;if(urls.length>1&&Math.abs(x)>45&&Math.abs(x)>Math.abs(y)*1.5)show(current+(x<0?1:-1));touch=null},{passive:true});
 renderPhotos();
};
