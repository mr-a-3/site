function storeUUID(){if(crypto.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=[...b].map(v=>v.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)}
/* Replace this name when the store's final brand is ready. */
const STORE_NAME = window.STORE_DATA?.brand || 'form';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const products = window.STORE_DATA.products;
const gridLayout=window.STORE_DATA.layout||{desktopColumns:3,mobileColumns:2};
const productGrid=document.querySelector('#product-grid');
const desktopColumns=[2,3,4,5,6,7].includes(gridLayout.desktopColumns)?gridLayout.desktopColumns:3;
productGrid.style.setProperty('--desktop-columns',desktopColumns);
productGrid.dataset.desktopColumns=String(desktopColumns);
productGrid.style.setProperty('--mobile-columns',[1,2,3,4].includes(gridLayout.mobileColumns)?gridLayout.mobileColumns:2);
productGrid.dataset.mobileColumns=String(gridLayout.mobileColumns);
const imageUrl=(p,w=850)=>p.image.startsWith('photo-')?`https://images.unsplash.com/${p.image}?auto=format&fit=crop&w=${w}&q=85`:p.image;
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:window.STORE_DATA.currency,maximumFractionDigits:2}).format(n);
const sale=p=>typeof p.discountPrice==='number'&&p.discountPrice>=0&&p.discountPrice<p.price;
const currentPrice=p=>sale(p)?p.discountPrice:p.price;
const discountPercent=p=>Math.floor((1-p.discountPrice/p.price)*100+1e-7);
const priceHtml=p=>sale(p)?`<span class="sale-prices"><del aria-label="Original price">${money(p.price)}</del><strong aria-label="Sale price">${money(p.discountPrice)}</strong></span>`:money(p.price);
const saleBadge=p=>sale(p)?`<span class="sale-badge">${discountPercent(p)}% OFF</span>`:'';
const selectedColors={};
const colorNames=[['Black','#222222'],['White','#ffffff'],['Grey','#919191'],['Cream','#eee9dc'],['Beige','#c5b192'],['Brown','#8a6045'],['Tan','#bc7655'],['Sage','#8d947d'],['Green','#42704b'],['Navy','#263650'],['Blue','#4985b4'],['Red','#ac3549'],['Pink','#e0a0b2'],['Gold','#c3a265'],['Purple','#9066a1']];
function colorName(hex){const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const v=rgb(hex);return colorNames.reduce((best,c)=>{const distance=rgb(c[1]).reduce((n,x,i)=>n+(x-v[i])**2,0);return distance<best.distance?{name:c[0],distance}:best},{name:'Color',distance:Infinity}).name}
function chosenColor(p){return p.colors.includes(selectedColors[p.id])?selectedColors[p.id]:p.colors[0]}
function colorOptions(p){return p.colors.length?'<div class="color-options" role="group" aria-label="Choose '+escapeHtml(p.name)+' color">'+p.colors.map(c=>'<button type="button" class="color-swatch" data-color-product="'+p.id+'" data-color="'+c+'" aria-label="'+colorName(c)+'" title="'+colorName(c)+'" aria-pressed="'+(chosenColor(p)===c)+'" style="--swatch:'+c+'"><span aria-hidden="true"></span></button>').join('')+'<span class="color-choice-label" data-color-label="'+p.id+'">'+colorName(chosenColor(p))+'</span></div>':''}
let offersOnly=false;let cart=[];let saved=[];let category='All';let lastFocus;let toastTimer;
try{const stored=JSON.parse(localStorage.getItem('form-preview-cart')||'[]');if(Array.isArray(stored))cart=stored.filter(i=>products.some(p=>p.id===i.id)&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=20).map(i=>({id:i.id,qty:i.qty,color:products.find(p=>p.id===i.id).colors.includes(i.color)?i.color:products.find(p=>p.id===i.id).colors[0]}));cart.forEach(i=>{if(i.color)selectedColors[i.id]=i.color});const wishes=JSON.parse(localStorage.getItem('form-preview-saved')||'[]');if(Array.isArray(wishes))saved=wishes.filter(id=>products.some(p=>p.id===id));}catch{}
const $=s=>document.querySelector(s);
function persist(){try{localStorage.setItem('form-preview-cart',JSON.stringify(cart));localStorage.setItem('form-preview-saved',JSON.stringify(saved));}catch{}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
function renderProducts(){const offerIds=offersOnly?new Set((activePromotion(window.STORE_DATA)?.items||[]).map(p=>p.id)):null;let list=products.filter(p=>(category==='All'||p.category===category)&&(!offerIds||offerIds.has(p.id)));const sort=$('#sort').value;if(sort==='low')list.sort((a,b)=>currentPrice(a)-currentPrice(b));if(sort==='high')list.sort((a,b)=>currentPrice(b)-currentPrice(a));$('#product-grid').innerHTML=list.map((p,i)=>`<article class="product-card" style="animation-delay:${i*55}ms"><div class="product-image-wrap"><button class="product-image-button" data-view="${p.id}" aria-label="View ${escapeHtml(p.name)}"><img src="${escapeHtml(imageUrl(p))}" alt="${escapeHtml(p.name)}" loading="lazy"></button>${saleBadge(p)}${p.badge?`<span class="product-badge">${escapeHtml(p.badge)}</span>`:''}<button class="wish-button ${saved.includes(p.id)?'saved':''}" data-save="${p.id}" aria-label="Save ${escapeHtml(p.name)}" aria-pressed="${saved.includes(p.id)}"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button><button class="quick-add" data-add="${p.id}" aria-label="Add ${escapeHtml(p.name)} to bag">+</button></div><div class="product-info"><div><button class="product-name" data-view="${p.id}">${escapeHtml(p.name)}</button><p class="product-type">${escapeHtml(p.type)}</p></div><span class="product-price">${priceHtml(p)}</span></div>${colorOptions(p)}</article>`).join('')||(offersOnly?'<p class="category-empty">No offers available right now.</p>':'<p class="category-empty">No products in this category yet.</p>');}
function setCategory(c){offersOnly=false;category=c;categoryPicker.value=c;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b.dataset.category===c);b.setAttribute('aria-pressed',b.dataset.category===c)});renderProducts();}
const categories=window.STORE_DATA.categories||[...new Set(products.map(p=>p.category))];
const categoryLinks=categories.map(c=>`<a href="#collection" data-nav-category="${escapeHtml(c)}">${escapeHtml(c)}</a>`).join('');
const desktopNav=$('.desktop-nav');
desktopNav.querySelectorAll('[data-nav-category]').forEach(a=>a.remove());
const categoryPicker=document.createElement('select');categoryPicker.className='category-picker';categoryPicker.setAttribute('aria-label','Shop by category');categoryPicker.innerHTML='<option value="All">Categories</option>'+categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
desktopNav.firstElementChild.after(categoryPicker);
categoryPicker.insertAdjacentHTML('afterend','<a href="#favourites-dialog" data-favourites-open>Favourites</a>');
categoryPicker.addEventListener('change',()=>{setCategory(categoryPicker.value);$('#collection').scrollIntoView({behavior:'smooth'})});
$('#mobile-nav').innerHTML=`<a href="#collection" data-nav-category="All">Shop all</a>${categoryLinks}<a href="#favourites-dialog" data-favourites-open>Favourites</a><a href="#contact">Contact us</a>`;
const filterContainer=$('.filter').parentElement;
filterContainer.innerHTML=['All',...categories].map(c=>`<button class="filter ${c==='All'?'active':''}" data-category="${escapeHtml(c)}" aria-pressed="${c==='All'}">${c==='All'?'Shop all':escapeHtml(c)}</button>`).join('');
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.category)));
document.querySelectorAll('[data-nav-category]').forEach(a=>a.addEventListener('click',()=>setCategory(a.dataset.navCategory)));
$('.desktop-nav a[href="#collection"]:not([data-nav-category])').addEventListener('click',()=>setCategory('All'));
$('#sort').addEventListener('change',renderProducts);
function renderCart(){const count=cart.reduce((n,i)=>n+i.qty,0);$('#cart-count').textContent=count;$('#drawer-count').textContent=`(${count})`;$('#cart-open').setAttribute('aria-label',`Open shopping bag, ${count} items`);$('#cart-summary').hidden=!count;$('#cart-items').innerHTML=count?cart.map(i=>{const p=products.find(p=>p.id===i.id);return `<div class="cart-item"><img src="${escapeHtml(imageUrl(p,250))}" alt="${escapeHtml(p.name)}"><div><div class="cart-item-top"><span>${escapeHtml(p.name)}</span><span>${money(currentPrice(p)*i.qty)}</span></div><p>${escapeHtml(p.category)}${i.color?' · '+colorName(i.color):''}</p><div class="quantity-row"><div class="quantity-control"><button data-quantity="${p.id}" data-change="-1" aria-label="Decrease ${escapeHtml(p.name)} quantity">−</button><span>${i.qty}</span><button data-quantity="${p.id}" data-change="1" aria-label="Increase ${escapeHtml(p.name)} quantity" ${i.qty>=20?'disabled':''}>+</button></div><button class="remove-item" data-remove="${p.id}">Remove</button></div></div></div>`}).join(''):`<div class="empty-cart"><span>◌</span><h3>A little room for good things.</h3><p>Your bag is waiting for its first favorite.</p><button class="button button-dark" id="empty-shop">Explore the collection </button></div>`;$('#subtotal').textContent=money(total());}
function total(){return cart.reduce((sum,i)=>sum+currentPrice(products.find(p=>p.id===i.id))*i.qty,0)}
function addToCart(id){const p=products.find(p=>p.id===id);const item=cart.find(i=>i.id===id);if(p.stock!=null&&(item?.qty??0)>=p.stock){toast(p.stock===0?'This product is out of stock.':'No more stock available.');return;}if(item&&item.qty>=20){toast('Maximum quantity is 20 per item.');return;}if(item)item.qty++;else cart.push({id,qty:1,color:chosenColor(p)});persist();renderCart();toast(`${products.find(p=>p.id===id).name} added to your bag`);return true}
function openCart(){lastFocus=document.activeElement;$('#cart-overlay').hidden=false;$('#cart-drawer').inert=false;$('#cart-drawer').classList.add('open');document.body.style.overflow='hidden';document.querySelector('main').inert=true;$('.header').inert=true;$('.footer').inert=true;$('#cart-close').focus()}
function closeCart(){if(!$('#cart-drawer').classList.contains('open'))return;$('#cart-drawer').classList.remove('open');$('#cart-drawer').inert=true;$('#cart-overlay').hidden=true;document.body.style.overflow='';document.querySelector('main').inert=false;$('.header').inert=false;$('.footer').inert=false;lastFocus?.focus()}
$('#cart-open').addEventListener('click',openCart);$('#cart-close').addEventListener('click',closeCart);$('#cart-overlay').addEventListener('click',closeCart);
document.addEventListener('keydown',e=>{if(!$('#cart-drawer').classList.contains('open'))return;if(e.key==='Escape')closeCart();if(e.key==='Tab'){const items=[...$('#cart-drawer').querySelectorAll('button:not(:disabled),a[href],input')].filter(el=>el.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
function productStats(p){
 const rating=p.reviewCount>0?p.rating:0;
 const star='<svg viewBox="0 0 24 24"><path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9Z"/></svg>';
 const stars=Array.from({length:5},(_,i)=>'<span class="rating-star">'+star+'<span class="rating-fill" style="width:'+Math.max(0,Math.min(1,rating-i))*100+'%">'+star+'</span></span>').join('');
 return `<div class="product-stats">${p.showReviews!==false?`<div class="rating-row"><span class="rating-stars" role="img" aria-label="${rating?rating.toFixed(1)+' out of 5 stars':'Not yet rated'}">${stars}</span><span class="rating-summary">${rating?'<strong>'+rating.toFixed(1)+'</strong> · '+p.reviewCount.toLocaleString()+' review'+(p.reviewCount===1?'':'s'):'No reviews yet'}</span></div>`:''}<div class="product-availability"><span class="stock-status ${p.stock===0?'is-out':'is-in'}"><i aria-hidden="true"></i>${p.stock===0?'Out of stock':'In stock'}</span><span class="sold-count">${(p.soldCount??0).toLocaleString()} sold</span></div></div>`;
}
function viewProduct(id){window.storeTrack?.(id,'click');const p=products.find(p=>p.id===id);$('#product-detail').innerHTML=`<img src="${escapeHtml(imageUrl(p))}" alt="${escapeHtml(p.name)}"><div class="detail-copy"><div class="eyebrow">${escapeHtml(p.category.toUpperCase())} / THE EVERYDAY EDIT</div><h2 id="detail-title">${escapeHtml(p.name)}</h2><div class="detail-price">${priceHtml(p)} ${saleBadge(p)}</div>${productStats(p)}<p>${escapeHtml(p.description)}</p>${colorOptions(p)}<div class="product-actions"><button class="button bag-button" data-add="${p.id}" ${p.stock===0?'disabled':''}>${p.stock===0?'Out of stock':'Add to bag <span>+</span>'}</button><button class="button button-dark" data-buy-now="${p.id}" ${p.stock===0?'disabled':''}>Buy now</button></div></div>`;window.enhanceProduct?.(p);$('#product-dialog').setAttribute('aria-labelledby','detail-title');$('#product-dialog').showModal()}
document.addEventListener('click',e=>{const color=e.target.closest('[data-color-product]');if(color){const id=Number(color.dataset.colorProduct),p=products.find(p=>p.id===id),value=color.dataset.color;if(p?.colors.includes(value)){selectedColors[id]=value;const item=cart.find(i=>i.id===id);if(item){item.color=value;persist();renderCart()}document.querySelectorAll('[data-color-product="'+id+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===value)));document.querySelectorAll('[data-color-label="'+id+'"]').forEach(l=>l.textContent=colorName(value))}}const buy=e.target.closest('[data-buy-now]');if(buy){const id=Number(buy.dataset.buyNow);if(!addToCart(id))return;$('#product-dialog').close();$('#checkout').click();return}const add=e.target.closest('[data-add]');if(add)addToCart(Number(add.dataset.add));const view=e.target.closest('[data-view]');if(view){if($('#search-dialog').open)$('#search-dialog').close();if(favouritesDialog.open)favouritesDialog.close();viewProduct(Number(view.dataset.view))}const save=e.target.closest('[data-save]');if(save){toggleFavourite(Number(save.dataset.save))}const qty=e.target.closest('[data-quantity]');if(qty){const i=cart.find(i=>i.id===Number(qty.dataset.quantity));const p=products.find(p=>p.id===i.id);i.qty=Math.min(20,p.stock??20,i.qty+Number(qty.dataset.change));cart=cart.filter(i=>i.qty>0);persist();renderCart();const replacement=$(`[data-quantity="${qty.dataset.quantity}"][data-change="${qty.dataset.change}"]`);if(replacement&&!replacement.disabled)replacement.focus();else $('#cart-close').focus()}const remove=e.target.closest('[data-remove]');if(remove){cart=cart.filter(i=>i.id!==Number(remove.dataset.remove));persist();renderCart();$('#cart-close').focus()}const close=e.target.closest('[data-close]');if(close)document.getElementById(close.dataset.close).close();if(e.target.closest('#empty-shop')){closeCart();$('#collection').scrollIntoView({behavior:'smooth'})}});
$('#hero-product').addEventListener('click',()=>viewProduct(products[0].id));
function renderSearch(){const query=$('#search-input').value.toLowerCase().trim();const results=products.filter(p=>`${escapeHtml(p.name)} ${escapeHtml(p.category)} ${escapeHtml(p.type)}`.toLowerCase().includes(query));$('#search-results').innerHTML=results.length?results.map(p=>`<button class="search-result" data-view="${p.id}"><img src="${escapeHtml(imageUrl(p,150))}" alt=""><span>${escapeHtml(p.name)}<small>${escapeHtml(p.category)}</small></span><strong>${priceHtml(p)}</strong><span style="flex:0"></span></button>`).join(''):'<p style="padding:25px 0;color:var(--muted)">No objects found. Try “Living”, “Tech”, or “Everyday”.</p>';}
$('#search-open').addEventListener('click',()=>{$('#search-input').value='';renderSearch();$('#search-dialog').showModal();$('#search-input').focus()});$('#search-input').addEventListener('input',renderSearch);

const favouritesDialog=document.createElement('dialog');
favouritesDialog.id='favourites-dialog';
favouritesDialog.className='search-dialog';
favouritesDialog.setAttribute('aria-labelledby','favourites-title');
favouritesDialog.innerHTML='<div class="dialog-head"><h2 id="favourites-title">Favourites</h2><button type="button" class="icon-button" data-close="favourites-dialog" aria-label="Close favourites" autofocus>✕</button></div><div class="search-results favourites-list"></div>';
document.body.append(favouritesDialog);
const favouritesList=favouritesDialog.querySelector('.favourites-list');
const favouritesClose=favouritesDialog.querySelector('[data-close]');
let openedFavouritesFromMobile=false;

function renderFavourites(){
  const items=products.filter(product=>saved.includes(product.id));
  favouritesList.innerHTML=items.length
    ? items.map(product=>{
        const name=escapeHtml(product.name);
        return '<div class="favourite-row"><button type="button" class="search-result" data-view="'+product.id+'"><img src="'+escapeHtml(imageUrl(product,150))+'" alt=""><span>'+name+'</span><strong>'+priceHtml(product)+'</strong></button><button type="button" class="favourite-remove" data-favourite-remove="'+product.id+'" aria-label="Remove '+name+' from favourites">Remove</button></div>';
      }).join('')
    : '<p>No favourites yet. Tap a heart to save a product.</p>';
}

function toggleFavourite(id){
  const remove=saved.includes(id);
  saved=remove?saved.filter(value=>value!==id):[...saved,id];
  persist();
  document.querySelectorAll('[data-save="'+id+'"]').forEach(button=>{
    button.classList.toggle('saved',!remove);
    button.setAttribute('aria-pressed',String(!remove));
  });
  toast(remove?'Removed from favourites':'Saved to favourites on this device');
}

document.addEventListener('click',event=>{
  const link=event.target.closest('[data-favourites-open]');
  if(!link)return;
  event.preventDefault();
  openedFavouritesFromMobile=!!link.closest('#mobile-nav');
  renderFavourites();
  favouritesDialog.showModal();
});
favouritesList.addEventListener('click',event=>{
  const button=event.target.closest('[data-favourite-remove]');
  if(!button)return;
  const index=[...favouritesList.querySelectorAll('[data-favourite-remove]')].indexOf(button);
  toggleFavourite(Number(button.dataset.favouriteRemove));
  renderFavourites();
  const remaining=favouritesList.querySelectorAll('[data-favourite-remove]');
  (remaining[Math.min(index,remaining.length-1)]||favouritesClose).focus();
});
favouritesDialog.addEventListener('close',()=>{
  if(openedFavouritesFromMobile&&!$('#product-dialog').open)$('#menu-toggle').focus({preventScroll:true});
  openedFavouritesFromMobile=false;
});

document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
$('#checkout').addEventListener('click',()=>{$('#checkout-review').innerHTML=cart.map(i=>{const p=products.find(p=>p.id===i.id);return `<div class="review-line"><span>${escapeHtml(p.name)} × ${i.qty}</span><span>${money(currentPrice(p)*i.qty)}</span></div>`}).join('')+`<div class="review-line"><strong>Subtotal</strong><strong>${money(total())}</strong></div>`;closeCart();$('#checkout-dialog').showModal()});
$('#newsletter-form').addEventListener('submit',e=>{e.preventDefault();$('#newsletter-message').textContent='Email signup is currently unavailable.';$('#email').value='';toast('Email signup is currently unavailable.')});
$('#menu-toggle').addEventListener('click',()=>{const open=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',open);$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation')});$('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false')}});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('.brand').forEach(el=>{el.firstChild.textContent=STORE_NAME});renderProducts();renderCart();

window.formViewProduct=viewProduct;

(()=>{let session;try{session=sessionStorage.getItem('store-visit');if(!session){session=storeUUID();sessionStorage.setItem('store-visit',session)}}catch{return}const sent=new Set();window.storeTrack=(productId,kind,color)=>{const key=productId+kind+(color||'');if(sent.has(key))return;sent.add(key);fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session,productId,kind,color}),keepalive:true}).catch(()=>{})};const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){window.storeTrack(Number(e.target.dataset.view),'view');observer.unobserve(e.target)}}),{threshold:.5});function watch(){document.querySelectorAll('.product-image-button[data-view]').forEach(el=>observer.observe(el))}new MutationObserver(watch).observe(document.querySelector('#product-grid'),{childList:true});watch();document.addEventListener('click',e=>{const b=e.target.closest('[data-color-product]');if(b)window.storeTrack(Number(b.dataset.colorProduct),'color',b.dataset.color)});})();

