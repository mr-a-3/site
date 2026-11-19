(()=>{
 const collection=document.querySelector('#collection');
 const banner=document.createElement('section');banner.className='store-offer';banner.setAttribute('aria-label','Current offers');banner.hidden=true;collection.before(banner);
 const chip=document.createElement('button');chip.type='button';chip.className='filter offer-filter';chip.textContent='Offers';chip.setAttribute('aria-pressed','false');chip.hidden=true;document.querySelector('.filters').append(chip);
 const dialog=document.createElement('dialog');dialog.className='offer-dialog';dialog.setAttribute('aria-labelledby','offer-title');document.body.append(dialog);
 let shown=false,signature='',timer;
 function shop(){if(dialog.open)dialog.close();setCategory('All');offersOnly=true;document.querySelectorAll('.filter').forEach(button=>{const selected=button===chip;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});renderProducts();collection.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});chip.focus({preventScroll:true})}
 chip.addEventListener('click',shop);
 banner.addEventListener('click',event=>{if(event.target.closest('[data-shop-offers]'))shop()});
 dialog.addEventListener('click',event=>{if(event.target.closest('[data-shop-offers]'))shop();else if(event.target===dialog||event.target.closest('[data-dismiss-offer]'))dialog.close()});
 function refresh(){
  const offer=activePromotion(window.STORE_DATA);clearTimeout(timer);
  if(!offer){banner.hidden=true;chip.hidden=true;if(dialog.open)dialog.close();if(offersOnly)setCategory('All');return}
  chip.hidden=false;const p=offer.settings;
  const detail=offer.percent?'Up to '+offer.percent+'% off':'Special prices';
  const categories=offer.categories.join(' · ');
  const next=JSON.stringify([p,offer.items.map(item=>[item.id,item.price,item.discountPrice])]);
  if(signature!==next){signature=next;banner.innerHTML='<div><strong>'+escapeHtml(p.title)+'</strong><p>'+escapeHtml(detail)+'<span> · '+escapeHtml(categories)+'</span></p></div><button type="button" data-shop-offers>Shop offers</button>';dialog.innerHTML='<button type="button" class="offer-close" data-dismiss-offer aria-label="Close offer">×</button><p class="offer-label">'+escapeHtml(p.title)+'</p><h2 id="offer-title">'+escapeHtml(detail)+'</h2><p>'+escapeHtml(categories)+'</p><button type="button" class="button button-dark" data-shop-offers>Shop offers</button>'}
  banner.hidden=!p.banner;
  if(!p.popup){if(dialog.open)dialog.close();return}
  let key='store-offer:';for(let i=0,hash=2166136261;i<signature.length;i++){hash=Math.imul(hash^signature.charCodeAt(i),16777619);if(i===signature.length-1)key+=hash>>>0}
  try{if(sessionStorage.getItem(key))return}catch{if(shown)return}
  timer=setTimeout(()=>{if(document.hidden||document.querySelector('dialog[open],.cart-drawer.open')||!document.querySelector('#mobile-nav').hidden||!activePromotion(window.STORE_DATA))return;dialog.showModal();shown=true;try{sessionStorage.setItem(key,'1')}catch{}},3000);
 }
 refresh();setInterval(()=>{if(!document.hidden)refresh()},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
